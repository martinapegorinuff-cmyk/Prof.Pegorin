PROF. PEGORIN ENGLISH — UNIT 1 PROTOTYPE v0.6

Added to v0.5:
- points by attempt: normal 3/4/5 points on first completion; 1 point on second and third attempts; no further points
- animated hourglass follows the points actually awarded
- Unit 1 achievement badges: Vocabulary Explorer, Grammar Master, Reading Explorer, Revision Master
- Perfect Score progression: 1, 5 and 10 perfect exercises
- Challenge Master: 20 perfect three-star exercises
- teacher admin prototype: ban/unban student, remove House Points, change House
- student-mode anti-copy deterrents: text selection/context menu/copy/cut/paste/drag and common keyboard shortcuts blocked
- student name/class watermark

IMPORTANT: screenshot prevention is not technically enforceable on a normal website. The watermark is a deterrent.
This remains a static GitHub Pages prototype; all data/admin changes are local to the same browser/device.
Teacher prototype code: PEGORIN (not secure authentication).


v0.7: added illustrated watercolor cards for Vocabulary, Grammar, Reading and Revision in the student home and Practice by Topic page.

v0.8:
- corrected illustrated topic cards
- images now use object-fit: contain instead of cover
- complete artwork is visible inside each card; no forced cropping

v0.9
- replaced Vocabulary, Grammar, Reading and Revision artwork with the approved 2x2 illustrations
- added eight illustrated badge assets
- badge sheet background removed to transparency so no white rectangular corners appear
- badge names remain part of each illustrated badge/banner
- locked badges are shown in grayscale/low opacity; unlocked badges retain full artwork

v0.9.1
- teacher.png now has a transparent outer background
- white rectangular corners around the teacher portrait are removed

v0.9.2
- fixed a JavaScript syntax error introduced while replacing the badge renderer
- Student Login and Teacher Login buttons work again
- all v0.9.1 images, transparent teacher portrait, badges and previous features are preserved

v0.9.3
- fixed missing getProgress() function used by the badge/progress system
- fixed personal-best tracking
- kept login form handling defensive
- added cache-busting query strings to CSS/JS for GitHub Pages

v1.0.0 — UNIT 2
- added the complete approved Unit 2 exercise bank
- Vocabulary: Family, Family Connections, Physical Appearance, description practice and challenge
- Grammar: have got, be/have got, demonstratives and possessive ’s
- one Unit 2 Reading Comprehension and two Revision exercises
- Unit 2-specific badge set
- Practice by Topic now includes Units 1–2
- Practice by Unit now includes separate Unit 1 and Unit 2 views
- approved V1/V2/V3 artwork reused to avoid unnecessary image proliferation
- visual demonstrative exercises rendered in HTML/CSS
- all existing login, teacher/admin, House Points, attempts, anti-copy and watermark functions preserved

v1.0.1
- V1: added missing no. 3 (parents)
- V2: corrected all names so they sit inside their parchment labels
- V3: all 16 illustrations are now numbered and used
- V3/V4/V5/V6/Revision references updated to match the corrected 1–16 numbering


v1.0.2
- Installed final approved Unit 2 V1/V2/V3 artwork.
- V3 reduced to the definitive 14 numbered figures only.
- Re-aligned every Unit 2 prompt that refers to V1/V2/V3.
- Removed all references to obsolete V3 pictures 15 and 16.
- Checked Vocabulary challenge distractors and Unit 2 Revision image references.

v1.0.3
- actually replaced Unit 2 V1, V2 and V3 with the final approved images
- V1 includes node 3 for parents
- V2 uses the centered-name final family tree
- V2 prompts now use only relationships unambiguously visible in that tree
- V3 uses the final 14-picture board only
- V3/V4/V5/V6 and Revision prompts updated to match pictures 1–14
- removed all references to discarded V3 images

v1.0.5
- Replaced Unit 2 V2 with the approved corrected 9-person family tree.
- Replaced Unit 2 V3 with the approved 14-person appearance board; figures 1 and 2 are full-body with height scales.
- Updated V2 to the 12 approved family-relationship sentences.
- Back buttons now follow the student's actual internal navigation history instead of returning to a fixed page.

v1.1.0
- Added first-time student registration: first name, last name, class, House dropdown and email.
- User ID is generated as First name + Last name.
- Password is generated from first 3 letters of first/last name + dot + 2-digit number; 67 and 69 are excluded.
- Added User ID/password login and Remember me.
- Student registration data and House are read-only from the student side.
- Teacher area supports multiple locally registered users: Change House, Remove Points, Ban/Unban and Delete User.
- Exercise results, attempts and House Points are stored separately per registered account.
IMPORTANT: GitHub Pages is static. Automatic email sending is not active in this prototype; credentials are shown after registration. Real email delivery and secure authentication require a backend/email service.

v1.1.1
- Student registration labels are now in Italian; House names remain in English.
- Registration asks specifically for "Email scolastica".
- Registration success screen prominently tells students to save User ID/password and ask the teacher if they lose them.
- Teacher/Admin student table now shows User ID, school email and password.
- Passwords are hidden by default and can be revealed individually with Mostra/Nascondi.
