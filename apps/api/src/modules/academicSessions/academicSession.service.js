import { AcademicSession } from "./academicSession.model.js";

function validateTerms(
  terms,
  sessionStartDate,
  sessionEndDate
) {
  if (!Array.isArray(terms)) {
    throw new Error(
      "Terms must be an array."
    );
  }

  const allowedTerms = [
    "First Term",
    "Second Term",
    "Third Term",
  ];

  const names = terms.map(
    (term) => term.name
  );

  if (
    new Set(names).size !==
    names.length
  ) {
    throw new Error(
      "Duplicate academic terms are not allowed."
    );
  }

  for (const name of names) {
    if (!allowedTerms.includes(name)) {
      throw new Error(
        `Invalid term: ${name}`
      );
    }
  }

  const sessionStart =
    new Date(sessionStartDate);

  const sessionEnd =
    new Date(sessionEndDate);

  if (
    sessionStart >= sessionEnd
  ) {
    throw new Error(
      "Academic session end date must be after the start date."
    );
  }

  const ranges = terms
    .map((term) => ({
      name: term.name,
      start: new Date(
        term.startDate
      ),
      end: new Date(
        term.endDate
      ),
    }))
    .sort(
      (a, b) =>
        a.start - b.start
    );

  for (const term of ranges) {
    if (
      term.start >= term.end
    ) {
      throw new Error(
        `${term.name} end date must be after its start date.`
      );
    }

    if (
      term.start < sessionStart ||
      term.end > sessionEnd
    ) {
      throw new Error(
        `${term.name} must fall within the academic session dates.`
      );
    }
  }

  for (
    let index = 1;
    index < ranges.length;
    index++
  ) {
    const previous =
      ranges[index - 1];

    const current =
      ranges[index];

    if (
      current.start <
      previous.end
    ) {
      throw new Error(
        `${current.name} overlaps with ${previous.name}.`
      );
    }
  }
}

export async function createSession(data) {
  validateTerms(
    data.terms,
    data.startDate,
    data.endDate
  );

  return AcademicSession.create({
    name: data.name,
    startDate: data.startDate,
    endDate: data.endDate,
    terms: data.terms || [],
    isActive: data.isActive ?? false,
    isCompleted: false,
  });
}

export async function getSessions(query = {}) {
  const filter = {};

  if (query.isActive !== undefined) {
    filter.isActive =
      query.isActive === true ||
      query.isActive === "true";
  }

  if (query.isCompleted !== undefined) {
    filter.isCompleted =
      query.isCompleted === true ||
      query.isCompleted === "true";
  }

  return AcademicSession.find(filter)
    .sort({
      startDate: -1,
    });
}

export async function getSessionById(id) {
  return AcademicSession.findById(id);
}

export async function updateSession(
  id,
  data
) {
  const existing =
    await AcademicSession.findById(id);

  if (!existing) {
    return null;
  }

  const merged = {
    name:
      data.name ?? existing.name,

    startDate:
      data.startDate ??
      existing.startDate,

    endDate:
      data.endDate ??
      existing.endDate,

    terms:
      data.terms ??
      existing.terms,

    isActive:
      data.isActive ??
      existing.isActive,

    isCompleted:
      data.isCompleted ??
      existing.isCompleted,
  };

  validateTerms(
    merged.terms,
    merged.startDate,
    merged.endDate
  );

  Object.assign(
    existing,
    merged
  );

  await existing.save();

  return existing;
}

export async function activateSession(id) {
  const session =
    await AcademicSession.findById(id);

  if (!session) {
    throw new Error(
      "Academic session not found."
    );
  }

  // Only one active session
  await AcademicSession.updateMany(
    {
      _id: {
        $ne: id,
      },
    },
    {
      $set: {
        isActive: false,
      },
    }
  );

  session.isActive = true;
  session.isCompleted = false;

  await session.save();

  return session;
}

export async function completeSession(id) {
  const session =
    await AcademicSession.findById(id);

  if (!session) {
    throw new Error(
      "Academic session not found."
    );
  }

  session.isActive = false;
  session.isCompleted = true;

  await session.save();

  return session;
}

export async function deleteSession(id) {
  return AcademicSession.findByIdAndDelete(id);
}