import React, { useEffect, useMemo, useState } from 'react';

const KEY = 'acl-course-pulse-v2';

// Fictional teaching records for the self-contained UI/UX exercise.
// Staff names and course descriptions are examples, not GUC historical records.
const COURSE_CATALOG = {
  CSEN701: {
    name: 'Advanced Computer Lab',
    description: 'A project-focused course emphasizing teamwork, planning, software development, and delivery across several milestones.',
    history: [
      {year: '2025/26', instructors: ['Dr. Mariam Farouk'], tas: ['Yara Hassan', 'Omar Fawzy']},
      {year: '2024/25', instructors: ['Dr. Karim Nabil'], tas: ['Nour Adel', 'Mina Sameh']},
    ],
  },
  MATH204: {
    name: 'Linear Algebra',
    description: 'Vectors, matrices, linear systems, and mathematical methods used in technical problem solving.',
    history: [
      {year: '2025/26', instructors: ['Dr. Salma Younis'], tas: ['Layla Maher', 'Ahmed Sherif']},
      {year: '2024/25', instructors: ['Dr. Rana Hamdy'], tas: ['Youssef Tarek', 'Dina Mourad']},
    ],
  },
  CSEN401: {
    name: 'Software Engineering',
    description: 'Software requirements, architecture, implementation practices, testing, and collaborative development.',
    history: [
      {year: '2025/26', instructors: ['Dr. Tamer Elsayed'], tas: ['Rana Fathy', 'Adham Khalil']},
      {year: '2024/25', instructors: ['Dr. Hala Mansour'], tas: ['Malak Samir', 'Ali Mahmoud']},
    ],
  },
  HUMA101: {
    name: 'Critical Thinking & Communication',
    description: 'A discussion-based course about assessing arguments, presenting ideas, and communicating effectively.',
    history: [
      {year: '2025/26', instructors: ['Dr. Dina Saad'], tas: ['Mariam Hossam', 'Youssef Nader']},
      {year: '2024/25', instructors: ['Dr. Reem Taha'], tas: ['Farah Amr', 'Sara Magdy']},
    ],
  },
  CSEN202: {
    name: 'Data Structures',
    description: 'Core data organization techniques and algorithms, with a focus on selecting suitable structures for different problems.',
    history: [
      {year: '2025/26', instructors: ['Dr. Amina Rashed'], tas: ['Rami Elshamy', 'Nada Wael']},
      {year: '2024/25', instructors: ['Dr. Yasser Salem'], tas: ['Hana Ehab', 'Bassel Mostafa']},
    ],
  },
};
const getCourse = code => COURSE_CATALOG[code?.toUpperCase()] || {
  name: 'Course details not yet added',
  description: 'This course does not have a profile in the example catalog.',
  history: [],
};
const readRoute = () => {
  const match = window.location.hash.match(/^#\/courses\/([^/?#]+)$/);
  return match ? decodeURIComponent(match[1]).toUpperCase() : null;
};
const seed = [
  {id:'r1',courseCode:'CSEN701',rating:4,comment:'A challenging team project. The weekly milestones helped.',owner:'you',name:'You',date:'2026-10-06'},
  {id:'r2',courseCode:'CSEN701',rating:5,comment:'You learn the most when your group communicates well.',owner:'other',name:'Farida',date:'2026-10-02'},
  {id:'r3',courseCode:'MATH204',rating:3,comment:'Useful material but the pace felt fast.',owner:'other',name:'Karim',date:'2026-09-28'},
  {id:'r4',courseCode:'CSEN401',rating:4,comment:'Tutorial exercises are very important.',owner:'you',name:'You',date:'2026-09-24'},
  {id:'r5',courseCode:'HUMA101',rating:5,comment:'Well organized and approachable.',owner:'other',name:'Mariam',date:'2026-09-21'},
  {id:'r6',courseCode:'CSEN701',rating:3,comment:'Good practical work, but demanding during exam week.',owner:'other',name:'Youssef',date:'2026-09-15'},
  {id:'r7',courseCode:'MATH204',rating:5,comment:'Excellent explanation of difficult concepts.',owner:'other',name:'Nadine',date:'2026-08-30'},
  {id:'r8',courseCode:'CSEN401',rating:2,comment:'More worked examples in lectures would help.',owner:'other',name:'Adam',date:'2026-08-17'},
  {id:'r9',courseCode:'CSEN202',rating:4,comment:'The assignments strengthened problem-solving skills.',owner:'other',name:'Hassan',date:'2026-08-09'},
];
function getSaved(){try {let s=JSON.parse(localStorage.getItem(KEY));return Array.isArray(s)?s:seed;}catch{return seed;}}
const avg = a => a.length?(a.reduce((s,r)=>s+r.rating,0)/a.length).toFixed(1):'—';
const stars = n => '★'.repeat(n)+'☆'.repeat(Math.max(0,5-n));
const formatDate = value => value ? new Date(`${value}T12:00:00`).toLocaleDateString('en-GB', {day:'numeric', month:'short', year:'numeric'}) : 'Unknown date';
// A course can be selected from the catalog without memorizing its code.
// The manual option preserves support for courses not yet in the catalog.
function CoursePicker({ value, onChange, id }) {
  const [manual, setManual] = useState(Boolean(value && !COURSE_CATALOG[value.toUpperCase()]));
  const catalogValue = COURSE_CATALOG[value?.toUpperCase()] ? value.toUpperCase() : '';
  return <div className="course-picker">
    <select id={id} value={manual ? '__other__' : catalogValue}
      onChange={e => {
        if (e.target.value === '__other__') { setManual(true); onChange(''); }
        else { setManual(false); onChange(e.target.value); }
      }}>
      <option value="">Select a course…</option>
      {Object.entries(COURSE_CATALOG).sort((a,b) => a[1].name.localeCompare(b[1].name))
        .map(([code, details]) => <option key={code} value={code}>{details.name} ({code})</option>)}
      <option value="__other__">Other course / enter a code…</option>
    </select>
    {manual && <input id={`${id}-manual`} aria-label="Other course code" value={value}
      placeholder="Enter a course code, e.g. CSEN999"
      onChange={e => onChange(e.target.value.toUpperCase())} />}
  </div>;
}
export default function App(){
 const [reviews,setReviews] = useState(getSaved);
 const [search,setSearch] = useState('');
 const [rating,setRating] = useState('all');
 const [course,setCourse] = useState('CSEN701');
 const [editor,setEditor] = useState(null);
 const [error,setError] = useState('');
 const [notice,setNotice] = useState('');
 const [tab,setTab] = useState('Overview');
 const [onlyMine,setOnlyMine] = useState(false);
 const [activeCourseCode,setActiveCourseCode] = useState(readRoute);
 useEffect(()=>{
  const changePage = () => {setActiveCourseCode(readRoute());window.scrollTo({top:0,behavior:'instant'});};
  window.addEventListener('hashchange',changePage);
  return ()=>window.removeEventListener('hashchange',changePage);
 },[]);
 const openCourse = code => {window.location.hash=`#/courses/${encodeURIComponent(code)}`;setActiveCourseCode(code.toUpperCase());window.scrollTo({top:0,behavior:'instant'});};
 const navigateTo = (where) => {
  window.location.hash='#/';
  setActiveCourseCode(null);
  if(where==='reviews')requestAnimationFrame(()=>document.getElementById('review-list')?.scrollIntoView({behavior:'smooth'}));
  else window.scrollTo({top:0,behavior:'smooth'});
 };
 useEffect(()=>localStorage.setItem(KEY,JSON.stringify(reviews)),[reviews]);
 const result = useMemo(()=>reviews.filter(r=>
   (!onlyMine || r.owner==='you') &&
   (rating==='all'||r.rating===Number(rating)) &&
   `${r.courseCode} ${getCourse(r.courseCode).name} ${r.comment} ${r.name}`.toLowerCase().includes(search.toLowerCase().trim())
 ),[reviews,search,rating,onlyMine]);
 const courseCards = Object.entries(COURSE_CATALOG).map(([code, details]) => {
   const entries = reviews.filter(r=>r.courseCode===code);
   return {code, name:details.name, count:entries.length, score:avg(entries)};
 });
 const selected = reviews.filter(x=>x.courseCode.toUpperCase()===course.trim().toUpperCase());
 const uniqueCourses = [...new Set(reviews.map(x=>x.courseCode))];
 const distribution = [5,4,3,2,1].map(n=>({n,total:reviews.filter(r=>r.rating===n).length}));
 function openEditor(r, suggestedCode=''){
   if(r && r.owner!=='you')return;
   const ownReview = suggestedCode && reviews.find(x=>x.owner==='you' && x.courseCode===suggestedCode);
   const current = r || ownReview;
   setError('');
   setEditor({id:current?.id||null, courseCode:current?.courseCode||suggestedCode,
     rating:String(current?.rating||''),comment:current?.comment||''});
 }
 function submit(e){e.preventDefault();if(!editor.courseCode.trim()){setError('Choose a course or enter its code.');return;}if(!/^[1-5]$/.test(editor.rating)){setError('Rating must be from 1 to 5.');return;}if(reviews.some(r=>r.id!==editor.id&&r.owner==='you'&&r.courseCode.toLowerCase()===editor.courseCode.trim().toLowerCase())){setError('You have already reviewed this course.');return;}
 const payload={courseCode:editor.courseCode.trim().toUpperCase(),rating:Number(editor.rating),comment:editor.comment.trim(),name:'You',owner:'you',date:new Date().toISOString().slice(0,10)};
 if(editor.id){setReviews(reviews.map(r=>r.id===editor.id?{...r,...payload}:r));setNotice('Review updated.');}else{setReviews([{...payload,id:'r-'+Date.now()},...reviews]);setNotice('Review posted.');}
 setEditor(null);
 }
 function reset(){setReviews(seed);setSearch('');setRating('all');setCourse('CSEN701');setOnlyMine(false);setEditor(null);setNotice('Example data restored.');}
 return <div className="review-app">
  <aside className="sidebar"><div className="logo"><span>✦</span> course<span>pulse</span></div><div className="side-caption">WORKSPACE</div><button className={tab==='Overview'?'active':''} onClick={()=>{setOnlyMine(false);setTab('Overview');navigateTo('top');}}><span>▦</span> Overview</button><button className={tab==='Browse'?'active':''} onClick={()=>{setOnlyMine(false);setTab('Browse');navigateTo('reviews');}}><span>≡</span> Browse reviews</button><button onClick={()=>openEditor(null)}><span>＋</span> Write a review</button><div className="side-caption gap">YOUR SPACE</div><button onClick={()=>{setOnlyMine(true);setSearch('');setRating('all');setTab('Browse');navigateTo('reviews');}}><span>♡</span> Your reviews</button><div className="side-end"><div className="badge-face">Y</div><div><strong>Your account</strong><small>Student profile</small></div></div></aside>
  <main className="content">{activeCourseCode ? (
    <section className="course-detail-page">
      <button type="button" className="back-to-reviews" onClick={()=>navigateTo('reviews')}>← Back to reviews</button>
      <header className="course-hero">
        <div><p className="eyebrow">COURSE PROFILE</p><h1>{getCourse(activeCourseCode).name}</h1><p className="course-id">{activeCourseCode} · SHAREABLE COURSE PROFILE</p><p className="course-description">{getCourse(activeCourseCode).description}</p></div>
        <div className="course-mini-score"><small>COURSE AVERAGE</small><strong>{avg(reviews.filter(r=>r.courseCode.toUpperCase()===activeCourseCode))}</strong><span>{reviews.filter(r=>r.courseCode.toUpperCase()===activeCourseCode).length} review(s)</span></div>
      </header>
      <div className="course-details-grid">
        <section className="panel teaching-history"><h2>Teaching history</h2><p>Instructors and teaching assistants for the previous two academic years.</p>
          {getCourse(activeCourseCode).history.length ? getCourse(activeCourseCode).history.map(entry=><div className="teaching-entry" key={entry.year}>
            <h3>{entry.year}</h3><div><small>INSTRUCTOR{entry.instructors.length===1?'':'S'}</small><span>{entry.instructors.join(', ')}</span></div><div><small>TEACHING ASSISTANTS</small><span>{entry.tas.join(', ')}</span></div>
          </div>) : <p className="history-empty">No example teaching records for this course.</p>}
          <p className="teaching-disclaimer">Illustrative course and teaching records; staff names are fictional.</p>
        </section>
        <section className="panel course-feedback"><div className="detail-review-head"><div><h2>What students are saying</h2><p>All feedback for {activeCourseCode}. Your own reviews can be edited.</p></div><button className="post-review" onClick={()=>openEditor(null,activeCourseCode)}>＋ {reviews.some(r=>r.owner==='you'&&r.courseCode===activeCourseCode)?'Edit your review':'Write review'}</button></div>
          {reviews.filter(r=>r.courseCode.toUpperCase()===activeCourseCode).length ? reviews.filter(r=>r.courseCode.toUpperCase()===activeCourseCode).map(r=><article className="course-review" key={r.id}>
            <div className="course-review-top"><strong>{r.name}</strong><span>{stars(r.rating)}</span></div><p>{r.comment||'No comment provided'}</p><div className="course-review-meta"><span>{formatDate(r.date)}</span>{r.owner==='you'&&<button className="row-edit" onClick={()=>openEditor(r)}>Edit your review</button>}</div>
          </article>) : <div className="course-review-empty">No reviews for this course yet.</div>}
        </section>
      </div>
    </section>
  ) : <><header className="page-head"><div><p className="eyebrow">ACADEMIC FEEDBACK PORTAL</p><h1>Course Review Board</h1><p>One place for course feedback, course signals and student opinions.</p></div><button className="post-review" onClick={()=>openEditor(null)}>＋ Write review</button></header>
   <section className="journey" aria-label="How to use CoursePulse">
     <div className="journey-heading"><span className="journey-step">01 / EXPLORE</span><span className="journey-step">02 / COMPARE FEEDBACK</span><span className="journey-step">03 / SHARE YOUR VIEW</span></div>
     <div className="journey-body">
       <div><p className="eyebrow">MAKE A CONFIDENT CHOICE</p><h2>Find your next course.<br/>Hear from students first.</h2><p>Browse real-looking example feedback, compare ratings and teaching history, then leave a review of your own.</p></div>
       <button className="journey-cta" onClick={()=>{setOnlyMine(false);setTab('Browse');navigateTo('reviews');}}>Explore reviews <span aria-hidden="true">↗</span></button>
     </div>
   </section>
   <section className="discover" aria-labelledby="discover-title">
     <div className="section-title"><div><p className="eyebrow">START WITH A COURSE</p><h2 id="discover-title">Explore the course catalog</h2><p>Choose a course to see its overview, teaching history and all student reviews.</p></div><span className="catalog-count">{courseCards.length} COURSES</span></div>
     <div className="course-cards">{courseCards.map(({code,name,count,score})=>
       <button className="catalog-card" key={code} onClick={()=>openCourse(code)} aria-label={`View ${name} course details`}>
         <span className="catalog-code">{code}</span><strong>{name}</strong>
         <span className="catalog-bottom"><span><b>{score}</b> <span className="catalog-star">★</span> · {count} {count===1?'review':'reviews'}</span><span className="catalog-arrow">↗</span></span>
       </button>
     )}</div>
   </section>
   <section className="metrics"><div className="metric"><small>ALL REVIEWS</small><strong>{reviews.length}</strong><span>Community contributions</span></div><div className="metric"><small>AVERAGE SCORE</small><strong>{avg(reviews)} <em>/ 5</em></strong><span>Calculated across entries</span></div><div className="metric"><small>COURSES RATED</small><strong>{uniqueCourses.length}</strong><span>Unique course codes</span></div></section>
   {notice&&<div className="notice" role="status">{notice}<button onClick={()=>setNotice('')}>✕</button></div>}
   <div className="analytic-grid"><section className="panel pulse"><div className="panel-head"><div><h2>Community rating overview</h2><p>Ratings from recent student submissions</p></div><span className="panel-tag">ALL COURSES</span></div><div className="pulse-content"><div className="donut" style={{background:`conic-gradient(#168778 0 ${(reviews.filter(r=>r.rating>=4).length/Math.max(reviews.length,1))*100}%, #e5ece9 0 100%)`}}><div><span>{avg(reviews)}</span><small>AVERAGE</small></div></div><div className="rating-bars">{distribution.map(d=><div key={d.n} className="rating-row"><span>{d.n}★</span><div className="barbg"><i style={{width:`${d.total/Math.max(...distribution.map(x=>x.total),1)*100}%`}}/></div><small>{d.total}</small></div>)}</div></div></section>
    <section className="panel summary"><div className="panel-head"><div><h2>Course score lookup</h2><p>Choose a course to view its average rating and review count.</p></div></div><label htmlFor="course-lookup">Choose a course<CoursePicker id="course-lookup" value={course} onChange={setCourse}/></label><div className="score"><span>Overall rating</span><strong>{avg(selected)}</strong><small>{selected.length} review(s)</small></div><div className="banner">Data updates as new reviews are added.</div>{course.trim()&&<button type="button" className="lookup-course-link" onClick={()=>openCourse(course.trim().toUpperCase())}>View course details →</button>}</section></div>
   <section className="review-list panel" id="review-list"><div className="panel-head reviews-heading"><div><h2>{onlyMine?'Your reviews':'Explore student reviews'}</h2><p>Search by course code, course name, comment or student. Filters update instantly.</p></div><button className="outline" onClick={reset}>Reset demo</button></div><div className="searchbar"><div className="searchinput"><span>⌕</span><input value={search} onChange={e=>setSearch(e.target.value)} aria-label="Search reviews" placeholder="Try CSEN701, teamwork, or Farida…"/></div><label><span>Rating</span><select value={rating} onChange={e=>setRating(e.target.value)}><option value="all">All ratings</option>{[5,4,3,2,1].map(n=><option key={n} value={n}>{n} stars</option>)}</select></label><button className="clear-filters" onClick={()=>{setSearch('');setRating('all');setOnlyMine(false);}}>Clear filters</button></div><div className="rows-wrapper"><table><thead><tr><th>Course</th><th>Stars</th><th>Student comment</th><th>Reviewer</th><th>Date</th><th>Action</th></tr></thead><tbody>{result.map(r=><tr key={r.id}><td><button type="button" className="course-link" title={`View ${getCourse(r.courseCode).name}`} onClick={()=>openCourse(r.courseCode)}><strong>{r.courseCode}</strong><small>{getCourse(r.courseCode).name}</small></button></td><td className="ratingcell">{stars(r.rating)}</td><td className="commentcell">{r.comment||'No comment provided'}</td><td>{r.name}</td><td>{formatDate(r.date)}</td><td>{r.owner==='you'?<button className="row-edit" onClick={()=>openEditor(r)}>Edit</button>:<span className="dim">—</span>}</td></tr>)}{result.length===0&&<tr><td colSpan="6">No matching reviews. Try a different search or clear the filters.</td></tr>}</tbody></table></div><p className="tablefoot" aria-live="polite">Showing {result.length} of {reviews.length} reviews {onlyMine?'· Your submissions':''}</p></section>
  </>}
  </main>
  {editor&&<div className="overlay" onMouseDown={e=>e.target===e.currentTarget&&setEditor(null)}><div className="modal" role="dialog" aria-modal="true" aria-label={editor.id?'Edit review':'Write review'}><div className="modal-title"><div><p className="eyebrow">YOUR CONTRIBUTION</p><h2>{editor.id?'Edit your review':'Share your course experience'}</h2><p>One review per course. You can edit yours any time.</p></div><button onClick={()=>setEditor(null)} aria-label="Close">✕</button></div><form onSubmit={submit}><label htmlFor="review-course">Choose a course<CoursePicker key={editor.id||"new"} id="review-course" value={editor.courseCode} onChange={v=>setEditor(s=>({...s,courseCode:v}))}/></label><label>Overall rating<select value={editor.rating} onChange={e=>setEditor(s=>({...s,rating:e.target.value}))}><option value="">Choose a rating (1–5)</option>{[1,2,3,4,5].map(n=><option key={n} value={n}>{n}</option>)}</select></label><label>Comment<textarea value={editor.comment} rows={5} onChange={e=>setEditor(s=>({...s,comment:e.target.value}))} placeholder="What should future students know? (optional)"/></label>{error&&<div className="formerror" role="alert">{error}</div>}<div className="modal-actions"><button type="button" onClick={()=>setEditor(null)}>Cancel</button><button className="post-review" type="submit">{editor.id?'Save review':'Submit review'}</button></div></form></div></div>}
 </div>;
}
