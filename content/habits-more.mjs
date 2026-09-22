import { table } from './apps.mjs';

export default [
  {
    topic: 'habits', slug: 'habit-tracker-ideas', published: '2026-09-22',
    title: 'Habit Tracker Ideas: 30 Clear Habits You Can Actually Mark',
    description: 'Browse 30 habit tracker ideas for home, learning, planning and wellbeing, then rewrite each one as a clear action with a realistic schedule.',
    intro: 'The best habit idea is not the most ambitious one. It is an action you can define clearly enough to know whether it happened on a busy day.',
    takeaway: 'Choose one useful area, turn the idea into a visible action, define “done” and schedule only the days on which you genuinely intend to do it.',
    sections: [
      ['Use ideas as prompts, not prescriptions', `<p>The examples below are starting points. Choose actions appropriate for your circumstances and adjust the size or frequency. A habit tracker is a record, not medical care, and it should not be used to grade symptoms or replace professional support.</p>`],
      ['Ten home and organization ideas', `<ul><li>Clear one surface</li><li>Prepare tomorrow’s bag</li><li>Review the calendar</li><li>File one document</li><li>Water a selected plant</li><li>Run the dishwasher</li><li>Plan the next grocery list</li><li>Put laundry away</li><li>Check the weekly budget</li><li>Back up one current project</li></ul><p>Replace vague labels such as “be organized” with the action you will mark.</p>`],
      ['Ten learning and creative ideas', `<ul><li>Read five pages</li><li>Practise vocabulary for ten minutes</li><li>Write one paragraph</li><li>Solve one math puzzle</li><li>Review class notes</li><li>Sketch for ten minutes</li><li>Practise an instrument</li><li>Complete one coding exercise</li><li>Save one useful reference</li><li>Summarize one thing learned</li></ul><p>A time limit or count makes the boundary visible. Increase it only when the smaller version fits reliably.</p>`],
      ['Ten routine and wellbeing ideas', `<ul><li>Prepare a balanced lunch</li><li>Take a planned screen break</li><li>Follow a chosen bedtime routine</li><li>Go outside for a short walk</li><li>Refill a water bottle</li><li>Write a brief mood note</li><li>Complete a planned workout</li><li>Stretch according to your routine</li><li>Call or message someone</li><li>Prepare medication as directed</li></ul><p>Health-related actions should follow guidance appropriate to you. Track the action, not a promise about an outcome.</p>`],
      ['Turn an idea into a tracking rule', table('From vague idea to markable action', ['Vague idea', 'Clear version', 'Schedule example'], [
        ['Read more', 'Read five pages', 'Monday–Friday'], ['Save money', 'Record Friday transfer', 'Every Friday'], ['Exercise', 'Complete planned session', 'Tuesday and Saturday'], ['Learn Spanish', 'Review ten flashcards', 'Daily'],
      ]) + `<p>Decide what happens on planned rest days. They should not count as missed if the habit was never scheduled. Also decide whether “more than the minimum” earns one completion or a separate note; changing that rule later can distort the record.</p>`],
      ['Add one habit in Habit Tracker Daily', `<p>Create the action with its exact repeat schedule and use the calendar to mark only completed days. Review the record after one or two weeks before adding several more habits.</p><p>Habit Tracker Daily supports flexible schedules and progress views, so a weekly planning action does not need to pretend to be daily. Your data stays on your device, with export available when you want a copy.</p>`],
    ], sources: [],
    faq: [['How many habits should I track at once?', 'Start with a number you can review honestly—often one new habit is enough. Add another only when the record remains useful.'], ['What makes a habit easy to track?', 'A clear action, a definition of done and a realistic schedule make the completion decision visible.']],
  },
  {
    topic: 'habits', slug: 'monthly-habit-tracker', published: '2026-09-22',
    title: 'Monthly Habit Tracker: Set Up and Review Your Calendar',
    description: 'Create a monthly habit tracker with clear completion rules, planned days, an honest completion-rate calculation and a practical end-of-month review.',
    intro: 'A monthly calendar can show patterns that a single streak hides. Set the rules before the month begins, then review completed and planned days together.',
    takeaway: 'Define the action and schedule, mark only planned completions, calculate completed ÷ planned days and use the review to adjust the next month.',
    sections: [
      ['Choose a definition of done', `<p>“Study” is difficult to mark consistently. “Review ten flashcards” or “complete one lesson” gives you a boundary. Write the definition beside the calendar so the rule does not quietly change halfway through the month.</p><p>If partial progress matters, keep it as a note rather than calling it a full completion under a different standard.</p>`],
      ['Mark the planned days first', `<p>A habit scheduled three times per week should not show four automatic failures on the other days. Mark or list the intended dates before tracking begins.</p><p>For a daily action, every date may be planned. For weekdays, weekends are neutral unless you deliberately add them.</p>`],
      ['Calculate the monthly completion rate', table('Illustrative monthly review', ['Item', 'Count'], [
        ['Planned days', '20'], ['Completed planned days', '16'], ['Missed planned days', '4'], ['Completion rate', '16 ÷ 20 = 80%'],
      ]) + `<p>Do not divide by every calendar day unless the habit was planned every day. A completion rate describes adherence to your own schedule, not the importance of the habit.</p>`],
      ['Look for patterns without inventing a story', `<p>Check whether missed days cluster around travel, late meetings or an unrealistic time slot. Record what you know, and avoid assuming a cause from one month of marks.</p><p>A note such as “three misses followed late shifts” is more useful than “I have no discipline.” It points to a schedule you can test next month.</p><p>Compare weekdays with weekends or morning plans with evening plans only when the schedule gives both groups enough examples. One unusual week may not justify rebuilding the whole habit.</p>`],
      ['Set up the next month in Habit Tracker Daily', `<p>Keep the same rule if it still fits, or change one part deliberately: the action size, repeat days or cue. Habit Tracker Daily supports flexible schedules, calendar check-ins and progress charts so the plan and review stay together.</p><p>Write the change in plain language—for example, “five pages instead of ten” or “Tuesday and Saturday instead of daily.” That makes the next review a comparison of two known plans.</p><p>Preserve the previous month rather than rewriting missed days. An honest history shows whether the revised plan works better.</p>`],
    ], sources: [],
    faq: [['Should unplanned days lower my completion rate?', 'No. Divide completed planned days by total planned days. Neutral rest days are not missed completions.'], ['Should I reset my tracker every month?', 'Start a new calendar period, but keep the earlier record. The history helps you compare schedules and identify repeatable patterns.']],
  },
];
