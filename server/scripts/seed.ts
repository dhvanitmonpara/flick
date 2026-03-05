import { eq } from "drizzle-orm";
import db from "../src/infra/db/index";
import { auth } from "../src/infra/auth/auth";
import AuthRepo from "../src/modules/auth/auth.repo";
import UserRepo from "../src/modules/user/user.repo";
import { colleges, users } from "../src/infra/db/tables";

const TEST_PASSWORD = "ChangeMeNow!123";
const TEST_EMAILS = [
  "test1@flick.com",
  "test2@flick.com",
  "test3@flick.com",
];

async function ensureSeedCollege() {
  const existingCollege = await db.query.colleges.findFirst({
    where: eq(colleges.emailDomain, "flick.com"),
  });

  if (existingCollege) {
    return existingCollege;
  }

  const [createdCollege] = await db
    .insert(colleges)
    .values({
      name: "Flick Test College",
      emailDomain: "flick.com",
      city: "San Francisco",
      state: "CA",
      profile: "https://yourcdn.com/default-college-profile.png",
    })
    .returning();

  return createdCollege;
}

async function uniqueUsername(base: string) {
  let candidate = base.toLowerCase();
  let suffix = 1;

  while (true) {
    const existing = await db.query.users.findFirst({
      where: eq(users.username, candidate),
    });

    if (!existing) {
      return candidate;
    }

    suffix += 1;
    candidate = `${base}${suffix}`.toLowerCase();
  }
}

async function ensureTestUser(email: string, index: number, collegeId: string) {
  let existingAuth = await AuthRepo.Read.findByEmail(email);

  if (!existingAuth) {
    await auth.api.signUpEmail({
      body: {
        name: `test${index}`,
        email,
        password: TEST_PASSWORD,
      },
    });

    existingAuth = await AuthRepo.Read.findByEmail(email);
  }

  if (!existingAuth) {
    throw new Error(`Unable to create/fetch auth user for ${email}`);
  }

  const existingProfile = await UserRepo.Read.findByAuthId(existingAuth.id, {});

  if (!existingProfile) {
    const username = await uniqueUsername(`test${index}`);

    await UserRepo.Write.create({
      authId: existingAuth.id,
      username,
      collegeId,
      branch: null,
      status: "ONBOARDING",
    });
  }

  await AuthRepo.Write.update(existingAuth.id, {
    emailVerified: true,
  });

  console.log(`Ensured user: ${email} (password: ${TEST_PASSWORD})`);
}

async function run() {
  const college = await ensureSeedCollege();

  for (const [index, email] of TEST_EMAILS.entries()) {
    await ensureTestUser(email, index + 1, college.id);
  }
}

run()
  .then(() => {
    console.log("Seeding completed.");
    process.exit(0);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
