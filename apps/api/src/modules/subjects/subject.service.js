import { Subject } from "./subject.model.js";

export async function createSubject(data) {
  return Subject.create({
    name: data.name,
    code: data.code,
    description: data.description,
    section: data.section,
    isCore: data.isCore ?? false,
    isActive: data.isActive ?? true,
  });
}

export async function getSubjects(query = {}) {
  const filter = {};

  if (query.section) {
    filter.section = query.section;
  }

  if (
    query.isActive !== undefined &&
    query.isActive !== ""
  ) {
    filter.isActive =
      query.isActive === true ||
      query.isActive === "true";
  }

  if (query.search) {
    filter.$or = [
      {
        name: {
          $regex: query.search,
          $options: "i",
        },
      },
      {
        code: {
          $regex: query.search,
          $options: "i",
        },
      },
    ];
  }

  return Subject.find(filter).sort({
    name: 1,
  });
}

export async function getSubjectById(id) {
  return Subject.findById(id);
}

export async function updateSubject(
  id,
  data
) {
  return Subject.findByIdAndUpdate(
    id,
    {
      $set: data,
    },
    {
      new: true,
      runValidators: true,
    }
  );
}

export async function deleteSubject(id) {
  return Subject.findByIdAndDelete(id);
}