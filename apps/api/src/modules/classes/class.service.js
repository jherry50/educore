import { SchoolClass } from "./class.model.js";
import { Teacher } from "../teachers/teacher.model.js";

export async function createClass(data) {
  return SchoolClass.create(data);
}

export async function getClasses({
  search = "",
  section,
  isActive,
}) {
  const filter = {};

  if (section) {
    filter.section = section;
  }

  if (typeof isActive !== "undefined") {
    filter.isActive =
      isActive === "true";
  }

  if (search) {
    filter.$or = [
      {
        name: {
          $regex: search,
          $options: "i",
        },
      },
      {
        code: {
          $regex: search,
          $options: "i",
        },
      },
      {
        level: {
          $regex: search,
          $options: "i",
        },
      },
    ];
  }

  return SchoolClass.find(filter)
    .populate({
      path: "classTeacher",
      select:
        "staffId department qualification specialization user",
      populate: {
        path: "user",
        select:
          "firstName lastName email phone isActive",
      },
    })
    .sort({
      section: 1,
      level: 1,
      name: 1,
    })
    .lean();
}

export async function getClassById(id) {
  return SchoolClass.findById(id)
    .populate({
      path: "classTeacher",
      select:
        "staffId department qualification specialization user",
      populate: {
        path: "user",
        select:
          "firstName lastName email phone isActive",
      },
    })
}

export async function updateClass(
  id,
  data
) {
  return SchoolClass.findByIdAndUpdate(
    id,
    data,
    {
      new: true,
      runValidators: true,
    }
  );
}

export async function deleteClass(id) {
  return SchoolClass.findByIdAndDelete(id);
}

export async function assignClassTeacher(
  classId,
  teacherId
) {
  const schoolClass =
    await SchoolClass.findById(classId);

  if (!schoolClass) {
    return null;
  }

  // Remove teacher assignment
  if (!teacherId) {
    schoolClass.classTeacher = null;

    await schoolClass.save();

    return SchoolClass.findById(
      schoolClass._id
    ).populate({
      path: "classTeacher",
      select:
        "staffId department qualification specialization user",
      populate: {
        path: "user",
        select:
          "firstName lastName email phone isActive",
      },
    });
  }

  // Verify teacher exists and is active
  const teacher =
    await Teacher.findOne({
      _id: teacherId,
      isActive: true,
      employmentStatus: "active",
    });

  if (!teacher) {
    const error = new Error(
      "Active teacher not found."
    );

    error.statusCode = 404;

    throw error;
  }

  schoolClass.classTeacher = teacher._id;

  await schoolClass.save();

  return SchoolClass.findById(
    schoolClass._id
  ).populate({
    path: "classTeacher",
    select:
      "staffId department qualification specialization user",
    populate: {
      path: "user",
      select:
        "firstName lastName email phone isActive",
  },
  });
}