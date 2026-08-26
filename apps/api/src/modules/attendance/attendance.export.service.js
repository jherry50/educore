import ExcelJS from "exceljs";

export async function generateAttendanceExcel(
  report
) {
  const workbook =
    new ExcelJS.Workbook();

  workbook.creator =
    "School Management System";

  workbook.created =
    new Date();

  const worksheet =
    workbook.addWorksheet(
      "Attendance Report"
    );

  worksheet.mergeCells(
    "A1:F1"
  );

  const titleCell =
    worksheet.getCell("A1");

  titleCell.value =
    "ATTENDANCE REPORT";

  titleCell.font = {
    bold: true,
    size: 16,
  };

  titleCell.alignment = {
    horizontal: "center",
    vertical: "middle",
  };

  worksheet.getRow(1).height = 28;

  worksheet.mergeCells(
    "A2:F2"
  );

  const filterCell =
    worksheet.getCell("A2");

  filterCell.value =
    buildFilterDescription(
      report.filters
    );

  filterCell.font = {
    italic: true,
    size: 10,
  };

  filterCell.alignment = {
    horizontal: "center",
  };

  worksheet.addRow([]);

  const summaryRow =
    worksheet.addRow([
      "Total",
      "Present",
      "Absent",
      "Late",
      "Excused",
      "Attendance Rate",
    ]);

  summaryRow.font = {
    bold: true,
  };

  summaryRow.eachCell(
    (cell) => {
      cell.alignment = {
        horizontal: "center",
      };

      cell.border = {
        top: {
          style: "thin",
        },
        bottom: {
          style: "thin",
        },
      };
    }
  );

  worksheet.addRow([
    report.summary.total,
    report.summary.present,
    report.summary.absent,
    report.summary.late,
    report.summary.excused,
    `${report.summary.attendancePercentage}%`,
  ]);

  worksheet.addRow([]);

  const headerRow =
    worksheet.addRow([
      "Date",
      "Student",
      "Admission Number",
      "Class",
      "Status",
      "Remarks",
    ]);

  headerRow.font = {
    bold: true,
    color: {
      argb: "FFFFFFFF",
    },
  };

  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: {
      argb: "FF1E3A8A",
    },
  };

  headerRow.alignment = {
    horizontal: "center",
    vertical: "middle",
  };

  report.records.forEach(
    (record) => {
      worksheet.addRow([
        formatDate(record.date),

        getStudentName(
          record.student
        ),

        record.student
          ?.admissionNumber ||
          "",

        record.class?.name ||
          "",

        record.status ||
          "",

        record.remarks ||
          "",
      ]);
    }
  );

  worksheet.columns = [
    {
      key: "date",
      width: 15,
    },
    {
      key: "student",
      width: 28,
    },
    {
      key: "admissionNumber",
      width: 20,
    },
    {
      key: "class",
      width: 20,
    },
    {
      key: "status",
      width: 15,
    },
    {
      key: "remarks",
      width: 35,
    },
  ];

  worksheet.views = [
    {
      state: "frozen",
      ySplit: 5,
    },
  ];

  worksheet.autoFilter = {
    from: "A6",
    to: "F6",
  };

  return workbook;
}

function getStudentName(
  student
) {
  if (!student) {
    return "";
  }

  return [
    student.firstName,
    student.middleName,
    student.lastName,
  ]
    .filter(Boolean)
    .join(" ");
}

function formatDate(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "";
  }

  return date.toLocaleDateString(
    "en-GB"
  );
}

function buildFilterDescription(
  filters = {}
) {
  const parts = [];

  if (filters.academicSession) {
    parts.push(
      `Session: ${filters.academicSession}`
    );
  }

  if (filters.term) {
    parts.push(
      `Term: ${filters.term}`
    );
  }

  if (filters.startDate) {
    parts.push(
      `From: ${filters.startDate}`
    );
  }

  if (filters.endDate) {
    parts.push(
      `To: ${filters.endDate}`
    );
  }

  return (
    parts.join(" | ") ||
    "All Attendance Records"
  );
}