import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import Event from "../models/Event.js";
import Product from "../models/Product.js";
import User from "../models/User.js";

const usersSeed = [
  {
    name: "Admin One",
    email: "admin@example.com",
    password: "Admin@12345",
    role: "admin",
    bio: "Platform administrator",
  },
  {
    name: "Aarav Patel",
    email: "aarav@example.com",
    password: "User@12345",
    role: "user",
    bio: "Community member focused on product updates",
  },
  {
    name: "Isha Verma",
    email: "isha@example.com",
    password: "User@12345",
    role: "user",
    bio: "Attends business and design meetups",
  },
  {
    name: "Rohan Mehta",
    email: "rohan@example.com",
    password: "Organizer@12345",
    role: "organizer",
    bio: "Organizer for technology events",
  },
  {
    name: "Neha Kapoor",
    email: "neha@example.com",
    password: "Organizer@12345",
    role: "organizer",
    bio: "Organizer for growth and marketing sessions",
  },
];

const eventsSeed = [
  {
    title: "Startup Pitch Night",
    category: "Business",
    city: "Bengaluru",
    date: "2026-05-12",
    description: "Live founder pitches and investor networking.",
  },
  {
    title: "Frontend Engineering Summit",
    category: "Technology",
    city: "Mumbai",
    date: "2026-05-22",
    description: "React, performance, and frontend architecture sessions.",
  },
  {
    title: "Product Design Mixer",
    category: "Design",
    city: "Pune",
    date: "2026-05-26",
    description: "Hands-on design critiques and product workshops.",
  },
  {
    title: "Community Hack Day",
    category: "Technology",
    city: "Delhi",
    date: "2026-06-02",
    description: "One-day collaborative hackathon for builders.",
  },
  {
    title: "AI Product Leadership Forum",
    category: "Technology",
    city: "Hyderabad",
    date: "2026-06-10",
    description: "Leadership talks on AI product planning and delivery.",
  },
  {
    title: "No-Code Growth Workshop",
    category: "Marketing",
    city: "Ahmedabad",
    date: "2026-06-18",
    description: "Hands-on growth automation workshop for early teams.",
  },
  {
    title: "SaaS Revenue Playbook Live",
    category: "Business",
    city: "Chennai",
    date: "2026-06-22",
    description: "Deep dive on pricing, retention, and expansion revenue.",
  },
  {
    title: "Design Systems Conference",
    category: "Design",
    city: "Bengaluru",
    date: "2026-07-01",
    description: "Patterns, accessibility, and scalable component systems.",
  },
  {
    title: "Creator Commerce Meetup",
    category: "Marketing",
    city: "Mumbai",
    date: "2026-07-12",
    description: "Sessions on community-led commerce and social funnels.",
  },
  {
    title: "Cloud Native Bootcamp",
    category: "Technology",
    city: "Pune",
    date: "2026-07-20",
    description: "Containerization, observability, and deployment labs.",
  },
];

const productsSeed = [
  {
    name: "Team Workspace Pro",
    type: "SaaS",
    price: 39,
    rating: 4.7,
    description: "Collaboration suite for distributed teams.",
  },
  {
    name: "Event Automation Kit",
    type: "Automation",
    price: 59,
    rating: 4.8,
    description: "Automated workflows for event operations.",
  },
  {
    name: "Brand Launch Toolkit",
    type: "Marketing",
    price: 29,
    rating: 4.4,
    description: "Templates and assets to launch campaigns faster.",
  },
  {
    name: "Chat Insights Suite",
    type: "Analytics",
    price: 49,
    rating: 4.6,
    description: "Usage metrics and engagement analytics for chat teams.",
  },
  {
    name: "Growth Experiment Studio",
    type: "Marketing",
    price: 69,
    rating: 4.9,
    description: "Run and evaluate experiments with guided templates.",
  },
  {
    name: "EventOps Command Center",
    type: "Automation",
    price: 79,
    rating: 4.8,
    description: "Complete event lifecycle management and alerts dashboard.",
  },
  {
    name: "Creator Community CRM",
    type: "SaaS",
    price: 45,
    rating: 4.5,
    description: "CRM and segmentation workflows for modern communities.",
  },
  {
    name: "Launch Metrics Pulse",
    type: "Analytics",
    price: 34,
    rating: 4.3,
    description: "Track launch KPIs and benchmark campaign performance.",
  },
  {
    name: "Brand Collateral Generator",
    type: "Design",
    price: 25,
    rating: 4.2,
    description: "Generate presentation and campaign collateral rapidly.",
  },
  {
    name: "Support Assistant Pro",
    type: "SaaS",
    price: 55,
    rating: 4.7,
    description: "AI-assisted support automation for product teams.",
  },
];

const upsertSeedUsers = async () => {
  const usersByEmail = new Map();

  for (const userData of usersSeed) {
    const existing = await User.findOne({ email: userData.email.toLowerCase() });

    if (existing) {
      existing.name = userData.name;
      existing.bio = userData.bio;
      existing.role = userData.role;
      if (userData.role === "organizer") {
        existing.organizerRequestStatus = "approved";
      }
      await existing.save({ validateBeforeSave: false });
      usersByEmail.set(existing.email, existing);
      continue;
    }

    const created = await User.create({
      ...userData,
      organizerRequestStatus: userData.role === "organizer" ? "approved" : "none",
    });
    usersByEmail.set(created.email, created);
  }

  return usersByEmail;
};

const upsertSeedData = async () => {
  await connectDB();

  const users = await upsertSeedUsers();
  const organizerOwner =
    users.get("rohan@example.com") ||
    users.get("neha@example.com") ||
    users.get("admin@example.com");

  if (!organizerOwner) {
    throw new Error("Seeder owner user could not be prepared");
  }

  for (const item of eventsSeed) {
    await Event.findOneAndUpdate(
      { title: item.title },
      {
        ...item,
        date: new Date(item.date),
        createdBy: organizerOwner._id,
      },
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
    );
  }

  for (const item of productsSeed) {
    await Product.findOneAndUpdate(
      { name: item.name },
      {
        ...item,
        createdBy: organizerOwner._id,
      },
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
    );
  }

  const [eventsCount, productsCount, usersCount] = await Promise.all([
    Event.countDocuments(),
    Product.countDocuments(),
    User.countDocuments(),
  ]);

  console.log(
    `Seeding complete. Users: ${usersCount}, Events: ${eventsCount}, Products: ${productsCount}`,
  );

  await mongoose.disconnect();
};

upsertSeedData().catch(async (error) => {
  console.error("Seeding failed:", error);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
