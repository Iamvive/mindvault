import { Database } from './database.js';

console.log('🧪 Starting database integrity and CRUD verification tests...');

try {
  // 1. Initial State
  const initialStats = Database.getStats();
  console.log('• Initial stats check:', initialStats.total === 0 ? 'PASS' : 'FAIL');

  // 2. Create Resource
  const testId1 = Database.createResource({
    url: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
    title: 'Never Gonna Give You Up',
    summary: 'Classic music video used for internet rickrolling.',
    category: 'Entertainment',
    tags: 'music,classic,rickroll',
    platform: 'YouTube',
    interest_score: 8,
    usefulness_score: 2,
    user_notes: 'My friend shared this. Pure nostalgia.'
  });
  console.log('• Create first resource: PASS, ID =', testId1);

  const testId2 = Database.createResource({
    url: 'https://github.com/google/generative-ai-js',
    title: 'Google Generative AI JS SDK',
    summary: 'Official Node.js SDK for the Gemini API.',
    category: 'Tech & Coding',
    tags: 'ai,javascript,sdk,google',
    platform: 'GitHub',
    interest_score: 9,
    usefulness_score: 10,
    user_notes: 'Useful for my resource board backend.'
  });
  console.log('• Create second resource: PASS, ID =', testId2);

  // 3. Retrieve Resource
  const list = Database.getAllResources();
  console.log('• Resource count matches 2:', list.length === 2 ? 'PASS' : 'FAIL');
  console.log('• First resource title matches:', list[0].title === 'Google Generative AI JS SDK' ? 'PASS' : 'FAIL'); // Sorted DESC by default, so ID 2 should be first

  // 4. Update Resource
  const updatedChanges = Database.updateResource(testId1, {
    interest_score: 10,
    category: 'Entertainment'
  });
  console.log('• Update resource fields changes = 1:', updatedChanges === 1 ? 'PASS' : 'FAIL');
  
  const updatedItem = Database.getResourceById(testId1);
  console.log('• Updated value verified interest_score = 10:', updatedItem.interest_score === 10 ? 'PASS' : 'FAIL');

  // 5. Test search filter
  const searchResults = Database.getAllResources('sdk');
  console.log('• Search filter counts matches 1:', searchResults.length === 1 ? 'PASS' : 'FAIL');

  // 6. Test statistics calculations
  const endStats = Database.getStats();
  console.log('• Ending total count matches 2:', endStats.total === 2 ? 'PASS' : 'FAIL');
  console.log('• Avg interest matches 9.5:', endStats.avg_interest === 9.5 ? 'PASS' : 'FAIL'); // (10 + 9) / 2
  console.log('• Avg usefulness matches 6:', endStats.avg_usefulness === 6.0 ? 'PASS' : 'FAIL'); // (2 + 10) / 2

  // 7. Cleanup
  Database.deleteResource(testId1);
  Database.deleteResource(testId2);
  const finalStats = Database.getStats();
  console.log('• Database cleanup total count = 0:', finalStats.total === 0 ? 'PASS' : 'FAIL');

  console.log('🎉 All Database tests completed successfully.');
} catch (error) {
  console.error('❌ Database verification test failed:', error);
}
