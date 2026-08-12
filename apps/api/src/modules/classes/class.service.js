import { SchoolClass } from "./class.model.js";

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
    .populate(
      "classTeacher",
      "firstName lastName email"
    )
    .sort({
      section: 1,
      level: 1,
      name: 1,
    })
    .lean();
}

export async function getClassById(id) {
  return SchoolClass.findById(id)
    .populate(
      "classTeacher",
      "firstName lastName email phone"
    );
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