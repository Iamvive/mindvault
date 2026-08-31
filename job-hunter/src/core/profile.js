import fs from 'node:fs';
import path from 'node:path';

export function loadMasterProfile(profilePath = './data/master_profile.json') {
  const resolvedPath = path.resolve(process.cwd(), profilePath);
  if (!fs.existsSync(resolvedPath)) {
    throw new Error(`Master profile not found at ${resolvedPath}`);
  }
  const content = fs.readFileSync(resolvedPath, 'utf8');
  const profile = JSON.parse(content);

  if (!profile.personal || !profile.personal.name) {
    throw new Error('Invalid master profile: missing personal details');
  }

  return profile;
}

export function saveMasterProfile(profile, profilePath = './data/master_profile.json') {
  const resolvedPath = path.resolve(process.cwd(), profilePath);
  const dir = path.dirname(resolvedPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(resolvedPath, JSON.stringify(profile, null, 2), 'utf8');
  return profile;
}

export function getAllCandidateSkills(profile) {
  const skillsSet = new Set();

  if (profile.skills) {
    for (const group of Object.values(profile.skills)) {
      if (Array.isArray(group)) {
        for (const skill of group) {
          skillsSet.add(skill.toLowerCase());
        }
      }
    }
  }

  if (profile.masterExperience) {
    for (const exp of profile.masterExperience) {
      if (Array.isArray(exp.techStack)) {
        for (const t of exp.techStack) {
          skillsSet.add(t.toLowerCase());
        }
      }
    }
  }

  return Array.from(skillsSet);
}
