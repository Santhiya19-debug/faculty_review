/**
 * Faculty Reviews Processor
 * Converts faculty_reviews.json into Supabase-compatible format
 * Generates missing metrics by analyzing review sentiment
 *
 * Usage: node scripts/process-faculty-data.js
 */

const fs = require('fs');
const path = require('path');

// ============================================================
// SENTIMENT KEYWORDS FOR METRIC INFERENCE
// ============================================================

const KEYWORDS = {
  strictness: {
    high: ['strict', 'harsh', 'tough', 'difficult', 'demanding', 'rigorous', 'strict grader', 'marks kata', 'maarenge'],
    low: ['chill', 'lenient', 'easy', 'cool', 'friendly', 'relaxed', 'casual', 'not strict'],
  },
  teachingQuality: {
    high: ['brilliant', 'excellent', 'good', 'clear', 'explains', 'best', 'amazing', 'goated', 'teaching', 'padhata', 'explains well'],
    low: ['worst', 'bad', 'boring', 'unclear', 'confusing', 'terrible', 'no idea'],
  },
  marksLeniency: {
    high: ['easy', 'marks', 'lenient', 'generous', 'internals', 'grade', 'good marks', 'eval', 'aa jaayega'],
    low: ['strict marks', 'hard grader', 'tough eval', 'kata', 'harsh marks'],
  },
  attendanceFlexibility: {
    high: ['attend', 'attendance', 'no attendance', 'flexible', 'no need', 'bunk'],
    low: ['strict attendance', 'mandatory', 'must attend'],
  },
};

// ============================================================
// SENTIMENT ANALYZER
// ============================================================

function analyzeReviewsSentiment(reviews) {
  if (!reviews || reviews.length === 0) {
    return {
      strictness: 5,
      teachingQuality: 5,
      marksLeniency: 5,
      attendanceFlexibility: 5,
    };
  }

  const allText = reviews.map(r => r.comment?.toLowerCase() || '').join(' ');

  const metrics = {
    strictness: { score: 0, count: 0 },
    teachingQuality: { score: 0, count: 0 },
    marksLeniency: { score: 0, count: 0 },
    attendanceFlexibility: { score: 0, count: 0 },
  };

  // Analyze strictness
  if (KEYWORDS.strictness.high.some(k => allText.includes(k))) {
    metrics.strictness.score += 8;
    metrics.strictness.count++;
  }
  if (KEYWORDS.strictness.low.some(k => allText.includes(k))) {
    metrics.strictness.score += 2;
    metrics.strictness.count++;
  }

  // Analyze teaching quality
  if (KEYWORDS.teachingQuality.high.some(k => allText.includes(k))) {
    metrics.teachingQuality.score += 8;
    metrics.teachingQuality.count++;
  }
  if (KEYWORDS.teachingQuality.low.some(k => allText.includes(k))) {
    metrics.teachingQuality.score += 2;
    metrics.teachingQuality.count++;
  }

  // Analyze marks leniency
  if (KEYWORDS.marksLeniency.high.some(k => allText.includes(k))) {
    metrics.marksLeniency.score += 8;
    metrics.marksLeniency.count++;
  }
  if (KEYWORDS.marksLeniency.low.some(k => allText.includes(k))) {
    metrics.marksLeniency.score += 2;
    metrics.marksLeniency.count++;
  }

  // Analyze attendance flexibility
  if (KEYWORDS.attendanceFlexibility.high.some(k => allText.includes(k))) {
    metrics.attendanceFlexibility.score += 8;
    metrics.attendanceFlexibility.count++;
  }
  if (KEYWORDS.attendanceFlexibility.low.some(k => allText.includes(k))) {
    metrics.attendanceFlexibility.score += 2;
    metrics.attendanceFlexibility.count++;
  }

  // Generate values with fallback to balanced if unclear
  const result = {};
  for (const [key, data] of Object.entries(metrics)) {
    if (data.count > 0) {
      result[key] = Math.round(data.score / data.count);
    } else {
      result[key] = 5; // Default balanced value if no keywords found
    }
  }

  return result;
}

// ============================================================
// PROCESS AND GENERATE DATA
// ============================================================

async function processData() {
  const inputPath = '/mnt/user-data/uploads/faculty_reviews__4_.json';
  const outputPath = '/mnt/user-data/outputs/faculty_reviews_processed.json';

  console.log('📖 Reading faculty_reviews.json...');
  const rawData = JSON.parse(fs.readFileSync(inputPath, 'utf8'));

  const processed = rawData.map((faculty, idx) => {
    // Generate missing metrics
    const metrics = analyzeReviewsSentiment(faculty.reviews);

    return {
      id: `faculty_${idx + 1}`,
      facultyName: faculty.facultyName,
      school: faculty.school || null,
      department: faculty.department || null,
      strictness: faculty.strictness !== null ? faculty.strictness : metrics.strictness,
      teachingQuality: faculty.teachingQuality !== null ? faculty.teachingQuality : metrics.teachingQuality,
      attendanceFlexibility: faculty.attendanceFlexibility !== null ? faculty.attendanceFlexibility : metrics.attendanceFlexibility,
      marksLeniency: faculty.marksLeniency !== null ? faculty.marksLeniency : metrics.marksLeniency,
      reviewCount: faculty.reviewCount || faculty.reviews?.length || 0,
      reviews: faculty.reviews || [],
      tags: faculty.tags || [],
      upvotes: faculty.upvotes || 0,
      createdAt: new Date().toISOString(),
    };
  });

  // Write processed data
  fs.writeFileSync(outputPath, JSON.stringify(processed, null, 2));
  console.log(`✅ Processed data saved to ${outputPath}`);

  // Stats
  const stats = {
    totalFaculties: processed.length,
    withSchool: processed.filter(f => f.school).length,
    withDepartment: processed.filter(f => f.department).length,
    withReviews: processed.filter(f => f.reviews.length > 0).length,
    metricsGenerated: processed.filter(f => processed.length > 0).length,
  };

  console.log('\n📊 Statistics:');
  console.log(`  Total faculties: ${stats.totalFaculties}`);
  console.log(`  With school: ${stats.withSchool}`);
  console.log(`  With department: ${stats.withDepartment}`);
  console.log(`  With reviews: ${stats.withReviews}`);
  console.log(`  Metrics generated: ${stats.metricsGenerated}`);

  // Metric distribution
  const allStrictness = processed.map(f => f.strictness);
  const allTeaching = processed.map(f => f.teachingQuality);
  const allMarks = processed.map(f => f.marksLeniency);
  const allAttendance = processed.map(f => f.attendanceFlexibility);

  console.log('\n📈 Metric Distributions:');
  console.log(`  Strictness: avg=${(allStrictness.reduce((a,b)=>a+b,0)/allStrictness.length).toFixed(1)}, min=${Math.min(...allStrictness)}, max=${Math.max(...allStrictness)}`);
  console.log(`  Teaching Quality: avg=${(allTeaching.reduce((a,b)=>a+b,0)/allTeaching.length).toFixed(1)}, min=${Math.min(...allTeaching)}, max=${Math.max(...allTeaching)}`);
  console.log(`  Marks Leniency: avg=${(allMarks.reduce((a,b)=>a+b,0)/allMarks.length).toFixed(1)}, min=${Math.min(...allMarks)}, max=${Math.max(...allMarks)}`);
  console.log(`  Attendance: avg=${(allAttendance.reduce((a,b)=>a+b,0)/allAttendance.length).toFixed(1)}, min=${Math.min(...allAttendance)}, max=${Math.max(...allAttendance)}`);
}

processData().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
