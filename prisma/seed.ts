import { prisma } from "../lib/prisma";

const categories = [
  {
    name: "Classroom",
    description: "Issues related to classrooms and classroom equipment.",
  },
  {
    name: "Laboratory",
    description: "Issues affecting university laboratories and lab equipment.",
  },
  {
    name: "Wi-Fi / Network",
    description: "Internet, Wi-Fi, network connectivity, and related problems.",
  },
  {
    name: "Furniture",
    description: "Broken or damaged desks, chairs, tables, and other furniture.",
  },
  {
    name: "Hostel",
    description: "Maintenance and facility issues related to student hostels.",
  },
  {
    name: "Cleanliness",
    description: "Cleaning, waste management, and sanitation-related issues.",
  },
  {
    name: "Electrical",
    description: "Electrical, lighting, power, and related infrastructure issues.",
  },
  {
    name: "Other",
    description: "Campus issues that do not fit another category.",
  },
];

const locations = [
  {
    name: "Academic Building 1 - Room 101",
    building: "Academic Building 1",
    floor: "1",
    room: "101",
  },
  {
    name: "Academic Building 1 - Room 302",
    building: "Academic Building 1",
    floor: "3",
    room: "302",
  },
  {
    name: "Academic Building 2 - Room 205",
    building: "Academic Building 2",
    floor: "2",
    room: "205",
  },
  {
    name: "Academic Building 5 - Room 502",
    building: "Academic Building 5",
    floor: "5",
    room: "502",
  },
  {
    name: "Software Engineering Lab",
    building: "Academic Building 5",
    floor: "4",
    room: "Lab 1",
  },
  {
    name: "Central Computer Lab",
    building: "Academic Building 3",
    floor: "3",
    room: "Lab 2",
  },
  {
    name: "DIU Library",
    building: "Library Building",
    floor: "1",
    room: null,
  },
  {
    name: "Main Cafeteria",
    building: "Cafeteria Building",
    floor: "1",
    room: null,
  },
  {
    name: "Hostel A - Room 203",
    building: "Hostel A",
    floor: "2",
    room: "203",
  },
  {
    name: "Hostel B - Room 105",
    building: "Hostel B",
    floor: "1",
    room: "105",
  },
];

async function main() {
  console.log("🌱 Starting database seed...");

  for (const category of categories) {
    await prisma.category.upsert({
      where: {
        name: category.name,
      },
      update: {
        description: category.description,
        isActive: true,
      },
      create: category,
    });
  }

  for (const location of locations) {
    const existingLocation = await prisma.location.findFirst({
      where: {
        name: location.name,
      },
    });

    if (existingLocation) {
      await prisma.location.update({
        where: {
          id: existingLocation.id,
        },
        data: {
          building: location.building,
          floor: location.floor,
          room: location.room,
          isActive: true,
        },
      });
    } else {
      await prisma.location.create({
        data: location,
      });
    }
  }

  console.log(`✅ Seeded ${categories.length} categories.`);
  console.log(`✅ Seeded ${locations.length} locations.`);
  console.log("🌱 Database seed completed.");
}

main()
  .catch((error) => {
    console.error("❌ Database seed failed:");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });