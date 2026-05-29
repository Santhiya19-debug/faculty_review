import json
import re

def analyze_sentiment(text):
    """Analyze review text and return estimated metric values."""
    
    if not text or not isinstance(text, str):
        return {}
    
    text_lower = text.lower()
    
    # Initialize scores with None — will be set only if detected
    metrics = {
        'strictness': None,
        'teachingQuality': None,
        'attendanceFlexibility': None,
        'marksLeniency': None,
    }
    
    # Strictness indicators
    strict_words = ['strict', 'harsh', 'tough', 'hard', 'difficult', 'demanding', 'rigorous', 'stringent']
    chill_words = ['chill', 'easy', 'lenient', 'relaxed', 'casual', 'flexible', 'cool', 'fun', 'approachable']
    
    strict_count = sum(1 for w in strict_words if w in text_lower)
    chill_count = sum(1 for w in chill_words if w in text_lower)
    
    if strict_count > chill_count and strict_count > 0:
        metrics['strictness'] = min(9, 6 + strict_count)  # 6-9
    elif chill_count > strict_count and chill_count > 0:
        metrics['strictness'] = max(2, 5 - chill_count)  # 2-5
    
    # Teaching quality indicators
    good_teach = ['teaching', 'explains', 'clear', 'good teacher', 'excellent', 'amazing', 'great', 'goated', 'helpful', 'knowledgeable', 'expert']
    bad_teach = ['boring', 'confusing', 'unclear', 'bad teacher', 'poor', 'awful', 'monotonous', 'disengaging']
    
    good_count = sum(1 for w in good_teach if w in text_lower)
    bad_count = sum(1 for w in bad_teach if w in text_lower)
    
    if good_count > bad_count and good_count > 0:
        metrics['teachingQuality'] = min(9, 6 + good_count)  # 6-9
    elif bad_count > good_count and bad_count > 0:
        metrics['teachingQuality'] = max(2, 5 - bad_count)  # 2-5
    
    # Attendance flexibility indicators
    attend_strict = ['attendance', 'present', 'proxy', 'bunk', 'strict attendance', 'no proxies']
    attend_flex = ['attendance not strict', 'flexible attendance', 'no attendance', 'relaxed attendance', 'don\'t care about attendance']
    
    attend_strict_count = sum(1 for w in attend_strict if w in text_lower)
    attend_flex_count = sum(1 for w in attend_flex if w in text_lower)
    
    if attend_flex_count > 0:
        metrics['attendanceFlexibility'] = max(7, 8 - attend_strict_count)  # 7-9
    elif attend_strict_count > 0:
        metrics['attendanceFlexibility'] = min(4, 3 + attend_strict_count)  # 1-4
    
    # Marks leniency indicators
    easy_marks = ['easy', 'marks', 'leniency', 'generous', 'good marks', 'easy marks', 'mm easy', 'gracious', 'lenient marking']
    hard_marks = ['strict marks', 'cutting', 'harsh marks', 'difficult marks', 'mar diya', 'maar diya', 'project me maar']
    
    easy_count = sum(1 for w in easy_marks if w in text_lower)
    hard_count = sum(1 for w in hard_marks if w in text_lower)
    
    if easy_count > hard_count and easy_count > 0:
        metrics['marksLeniency'] = min(9, 6 + easy_count)  # 6-9
    elif hard_count > easy_count and hard_count > 0:
        metrics['marksLeniency'] = max(2, 5 - hard_count)  # 2-5
    
    # If no strong signals, use moderate value
    for key in metrics:
        if metrics[key] is None:
            metrics[key] = 5  # default moderate value
    
    return metrics

def process_faculty(faculty):
    """Generate missing metrics for a faculty based on their reviews."""
    
    # Skip if metrics already exist
    if faculty.get('strictness') is not None:
        return faculty
    
    # Collect all reviews
    reviews = faculty.get('reviews', [])
    if not reviews:
        # No reviews — use all defaults of 5
        faculty['strictness'] = 5
        faculty['teachingQuality'] = 5
        faculty['attendanceFlexibility'] = 5
        faculty['marksLeniency'] = 5
        return faculty
    
    # Analyze all reviews and aggregate
    all_metrics = {
        'strictness': [],
        'teachingQuality': [],
        'attendanceFlexibility': [],
        'marksLeniency': [],
    }
    
    for review in reviews:
        comment = review.get('comment', '')
        sentiments = analyze_sentiment(comment)
        for key, value in sentiments.items():
            if value is not None:
                all_metrics[key].append(value)
    
    # Average the metrics, or use 5 if no data
    for key in all_metrics:
        if all_metrics[key]:
            avg = sum(all_metrics[key]) / len(all_metrics[key])
            faculty[key] = round(avg)
        else:
            faculty[key] = 5
    
    return faculty

# Main
if __name__ == '__main__':
    with open('/mnt/user-data/uploads/faculty_reviews__4_.json', 'r', encoding='utf-8') as f:
        faculties = json.load(f)
    
    # Process all faculties
    for faculty in faculties:
        process_faculty(faculty)
    
    # Save processed file
    with open('/home/claude/faculty-review/faculty_reviews_processed.json', 'w', encoding='utf-8') as f:
        json.dump(faculties, f, indent=2, ensure_ascii=False)
    
    # Stats
    stats = {
        'total': len(faculties),
        'metric_distribution': {
            'strictness': {},
            'teachingQuality': {},
            'attendanceFlexibility': {},
            'marksLeniency': {},
        }
    }
    
    for metric in ['strictness', 'teachingQuality', 'attendanceFlexibility', 'marksLeniency']:
        for fac in faculties:
            val = fac.get(metric, 5)
            stats['metric_distribution'][metric][val] = stats['metric_distribution'][metric].get(val, 0) + 1
    
    print("Processing complete!")
    print(f"Total faculties processed: {stats['total']}")
    print("\nMetric distributions:")
    for metric, dist in stats['metric_distribution'].items():
        print(f"\n{metric}:")
        for val in sorted(dist.keys()):
            print(f"  {val}: {dist[val]}")
    
    with open('/home/claude/faculty-review/processing_stats.json', 'w') as f:
        json.dump(stats, f, indent=2)
    
    print("\nFiles created:")
    print("  - faculty_reviews_processed.json (for import)")
    print("  - processing_stats.json (statistics)")

