import { Student } from "./student.model.js";

export async function createStudent(data) {
  return Student.create(data);
}

export async function getStudents({
  page = 1,
  limit = 10,
  search = "",
  status,
  classId,
}) {
  const skip =
    (page - 1) * limit;

  const filter = {};

  if (status) {
    filter.status = status;
  }

  if (classId) {
    filter.class = classId;
  }

  if (search) {
    filter.$or = [
      {
        firstName: {
          $regex: search,
          $options: "i",
        },
      },
      {
        lastName: {
          $regex: search,
          $options: "i",
        },
      },
      {
        admissionNumber: {
          $regex: search,
          $options: "i",
        },
      },
    ];
  }

  const [
    students,
    total,
  ] = await Promise.all([
    Student.find(filter)
      .populate(
        "class",
        "name code section level"
      )
      .populate(
        "parent",
        "firstName lastName email"
      )
      .sort({
        createdAt: -1,
      })
      .skip(skip)
      .limit(limit)
      .lean(),

    Student.countDocuments(filter),
  ]);

  return {
    students,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(
        total / limit
      ),
    },
  };
}

export async function getStudentById(
  id
) {
  return Student.findById(id)
    .populate(
        "class",
        "name code section level"
    )
    .populate(
      "parent",
      "firstName lastName email phone"
    );
}

export async function updateStudent(
  id,
  data
) {
  return Student.findByIdAndUpdate(
    id,
    data,
    {
      new: true,
      runValidators: true,
    }
  );
}

export async function deleteStudent(id) {
  return Student.findByIdAndDelete(id);
}