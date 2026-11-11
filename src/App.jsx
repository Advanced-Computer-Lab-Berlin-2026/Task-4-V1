import React, { useEffect, useId, useMemo, useRef, useState } from 'react';

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

const normalize = value => value.trim().toUpperCase();
const formatDate = value => new Intl.DateTimeFormat(undefined, {dateStyle:'medium'}).format(new Date(`${value}T12:00:00`));
const ratingLabels = ['Very poor', 'Poor', 'Average', 'Good', 'Excellent'];

// Native dialogs provide focus containment and make the background inert.
function Dialog({title, onClose, children, initialFocus}) {
 const ref = useRef(null);
 const titleId = useId();
 const closeRef = useRef(onClose);
 closeRef.current = onClose;
 useEffect(() => {
  const dialog = ref.current;
  const previous = document.activeElement;
  dialog.showModal();
  dialog.querySelector(initialFocus || 'button, input, select, textarea')?.focus();
  return () => {
   dialog.close();
   if (previous?.isConnected) previous.focus();
   else document.getElementById('write-review')?.focus();
  };
 }, []);
 return <dialog ref={ref} className="modal" aria-labelledby={titleId}
  onCancel={e=>{e.preventDefault();closeRef.current();}}
  onClick={e=>{if(e.target===e.currentTarget){const r=e.currentTarget.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeRef.current();}}}>
  <div className="modal-title"><h2 id={titleId}>{title}</h2><button type="button" onClick={onClose} aria-label="Close dialog">✕</button></div>{children}
 </dialog>;
}

// One styled combobox for editable course suggestions and fixed filter choices.
function Dropdown({id, label, value, onChange, options, editable=false, ...inputProps}) {
 const uid=useId();
 const inputId=id||`${uid}-input`;
 const listId=`${uid}-options`;
 const inputRef=useRef(null);
 const listRef=useRef(null);
 const [open,setOpen]=useState(false);
 const [query,setQuery]=useState('');
 const [active,setActive]=useState(-1);
 const matches=options.filter(option=>!editable||`${option.label} ${option.description||''}`.toLowerCase().includes(query.toLowerCase()));
 const selected=options.find(option=>option.value===value);
 const displayValue=editable?value:selected?.label||'';
 function show(){setQuery('');setActive(options.findIndex(option=>option.value===value));setOpen(true);}
 function choose(option){onChange(option.value);setQuery('');setOpen(false);setActive(-1);inputRef.current?.focus({preventScroll:true});}
 useEffect(()=>{
  const list=listRef.current;
  const option=list?.children[active];
  if(!option)return;
  if(option.offsetTop<list.scrollTop)list.scrollTop=option.offsetTop;
  else if(option.offsetTop+option.offsetHeight>list.scrollTop+list.clientHeight)list.scrollTop=option.offsetTop+option.offsetHeight-list.clientHeight;
 },[active]);
 function keyDown(e){
  if(e.key==='Escape'&&open){e.preventDefault();e.stopPropagation();setOpen(false);return;}
  if(e.key==='Tab'){setOpen(false);return;}
  if(e.key==='ArrowDown'||e.key==='ArrowUp'){
   e.preventDefault();
   if(!open){show();setActive(e.key==='ArrowDown'?0:options.length-1);}
   else setActive(i=>matches.length?(i+(e.key==='ArrowDown'?1:-1)+matches.length)%matches.length:-1);
  }else if(open&&e.key==='Enter'){
   e.preventDefault();if(matches[active])choose(matches[active]);else setOpen(false);
  }else if(!editable&&e.key===' '){e.preventDefault();if(open)setOpen(false);else show();}
  else if(!editable&&e.key.length===1){
   e.preventDefault();const index=options.findIndex(option=>option.label.toLowerCase().startsWith(e.key.toLowerCase()));
   setQuery('');setOpen(true);setActive(index);
  }else if(open&&!editable&&(e.key==='Home'||e.key==='End')){e.preventDefault();setActive(e.key==='Home'?0:matches.length-1);}
 }
 return <div className="dropdown" onBlur={e=>{if(!e.currentTarget.contains(e.relatedTarget))setOpen(false);}}>
  {label&&<label htmlFor={inputId}>{label}</label>}
  <div className="dropdown-control"><input {...inputProps} id={inputId} ref={inputRef} role="combobox" autoComplete="off" readOnly={!editable}
   value={displayValue} aria-expanded={open} aria-controls={open?listId:undefined} aria-haspopup="listbox"
   aria-autocomplete={editable?'list':undefined} aria-activedescendant={open&&matches[active]?`${listId}-${active}`:undefined}
   onClick={()=>{if(!open)show();else if(!editable)setOpen(false);}}
   onChange={e=>{onChange(e.target.value);setQuery(e.target.value);setActive(-1);setOpen(true);}} onKeyDown={keyDown}/>
   <button type="button" className="dropdown-arrow" tabIndex={-1} aria-label={open?'Close options':'Show options'} onMouseDown={e=>e.preventDefault()} onClick={()=>{inputRef.current?.focus({preventScroll:true});if(open)setOpen(false);else show();}}><span aria-hidden="true">⌄</span></button>
  </div>
  {open&&<div className="dropdown-popup"><ul ref={listRef} id={listId} role="listbox" aria-label={label||'Course suggestions'}>
   {matches.map((option,i)=><li key={option.value} id={`${listId}-${i}`} role="option" aria-selected={option.value===value} className={i===active?'highlighted':''}
    onMouseDown={e=>e.preventDefault()} onClick={()=>choose(option)}><strong>{option.label}</strong>{option.description&&<small>{option.description}</small>}</li>)}
  </ul>{!matches.length&&<p className="dropdown-empty" role="status">No matching courses. You can keep your entered code.</p>}</div>}
 </div>;
}

export default function App(){
 const [reviews,setReviews] = useState(getSaved);
 const [search,setSearch] = useState('');
 const [rating,setRating] = useState('all');
 const [sort,setSort] = useState('newest');
 const [view,setView] = useState('all');
 const [courseSearch,setCourseSearch] = useState('');
 const [course,setCourse] = useState('CSEN701');
 const [editor,setEditor] = useState(null);
 const [errors,setErrors] = useState({});
 const [notice,setNotice] = useState('');
 const [menuOpen,setMenuOpen] = useState(false);
 const [resetOpen,setResetOpen] = useState(false);
 const [discardOpen,setDiscardOpen] = useState(false);
 const [activeCourseCode,setActiveCourseCode] = useState(readRoute);
 const originalDraft = useRef('');
 const pendingAction = useRef(null);
 const focusTarget = useRef('page-heading');
 const [storageError,setStorageError] = useState('');
 useEffect(()=>{
  const previousRestoration=window.history.scrollRestoration;
  window.history.scrollRestoration='manual';
  const changePage = () => {setActiveCourseCode(readRoute());requestAnimationFrame(()=>window.scrollTo({top:0,left:0,behavior:'instant'}));};
  window.addEventListener('hashchange',changePage);
  return ()=>{window.removeEventListener('hashchange',changePage);window.history.scrollRestoration=previousRestoration;};
 },[]);
 useEffect(()=>{
  const target = document.getElementById(focusTarget.current);
  target?.focus({preventScroll:true});
  window.scrollTo({top:0,left:0,behavior:'instant'});
 },[activeCourseCode,view]);
 useEffect(()=>{
  try{localStorage.setItem(KEY,JSON.stringify(reviews));setStorageError('');}
  catch{setStorageError('Changes could not be saved on this device. Keep this page open and allow browser storage before continuing.');}
 },[reviews]);
 const codes = [...new Set([...Object.keys(COURSE_CATALOG), ...reviews.map(r=>r.courseCode)])].sort();
 const courseOptions=codes.map(code=>({value:code,label:code,description:getCourse(code).name}));
 const selected = reviews.filter(r=>r.courseCode===normalize(course));
 const ownReview = code => reviews.find(r=>r.owner==='you'&&r.courseCode===code);
 const distribution = [5,4,3,2,1].map((n,i)=>({n,total:reviews.filter(r=>r.rating===n).length,color:['#17636d','#32838b','#66a6ac','#aacdd0','#e0eeee'][i]}));
 let cursor = 0;
 const segments = distribution.map(d=>{const start=cursor;cursor+=reviews.length?d.total/reviews.length*100:0;return `${d.color} ${start}% ${cursor}%`;}).join(',');
 const result = useMemo(()=>reviews.filter(r=>
  (view!=='mine'||r.owner==='you') && (rating==='all'||r.rating===Number(rating)) &&
  `${r.courseCode} ${getCourse(r.courseCode).name} ${r.comment} ${r.name}`.toLowerCase().includes(search.trim().toLowerCase())
 ).sort((a,b)=>sort==='highest'?b.rating-a.rating||b.date.localeCompare(a.date):sort==='lowest'?a.rating-b.rating||b.date.localeCompare(a.date):b.date.localeCompare(a.date)),[reviews,view,rating,search,sort]);
 const courseResults = codes.filter(code=>`${code} ${getCourse(code).name}`.toLowerCase().includes(courseSearch.trim().toLowerCase()));
 function browse(nextView='all'){
  focusTarget.current='review-heading';setView(nextView);setMenuOpen(false);
  window.location.hash='#/';setActiveCourseCode(null);
  requestAnimationFrame(()=>{const heading=document.getElementById('review-heading');heading?.focus({preventScroll:true});window.scrollTo({top:0,left:0,behavior:'instant'});});
 }
 function home(){focusTarget.current='page-heading';setView('all');setMenuOpen(false);window.location.hash='#/';setActiveCourseCode(null);requestAnimationFrame(()=>{document.getElementById('page-heading')?.focus({preventScroll:true});window.scrollTo({top:0,left:0,behavior:'instant'});});}
 function courseLink(){focusTarget.current='page-heading';setMenuOpen(false);requestAnimationFrame(()=>window.scrollTo({top:0,left:0,behavior:'instant'}));}
 function openEditor(r=null, code=''){
  if(r&&r.owner!=='you')return;
  const draft={id:r?.id||null,courseCode:r?.courseCode||code,rating:String(r?.rating||''),comment:r?.comment||''};
  originalDraft.current=JSON.stringify(draft);setErrors({});setEditor(draft);setMenuOpen(false);
  requestAnimationFrame(()=>document.getElementById('review-course')?.focus());
 }
 function askDiscard(action=()=>setEditor(null)){
  if(editor && JSON.stringify(editor)!==originalDraft.current){pendingAction.current=action;setDiscardOpen(true);}
  else action();
 }
 function changeField(field,value){setEditor(s=>({...s,[field]:value}));setErrors(s=>{const next={...s};delete next[field];return next;});}
 function clearFilters(){setSearch('');setRating('all');}
 function submit(e){
  e.preventDefault();const code=normalize(editor.courseCode);const next={};
  if(!code)next.courseCode='Enter a course code.';
  const duplicate=reviews.find(r=>r.id!==editor.id&&r.owner==='you'&&r.courseCode===code);
  if(duplicate)next.courseCode='You have already reviewed this course. Edit your existing review instead.';
  if(!/^[1-5]$/.test(editor.rating))next.rating='Choose a whole-number rating from 1 to 5.';
  if(Object.keys(next).length){setErrors(next);requestAnimationFrame(()=>document.getElementById(next.courseCode?'review-course':'rating-1')?.focus());return;}
  const payload={courseCode:code,rating:Number(editor.rating),comment:editor.comment.trim(),name:'You',owner:'you'};
  if(editor.id)setReviews(rs=>rs.map(r=>r.id===editor.id?{...r,...payload,updatedAt:new Date().toISOString()}:r));
  else setReviews(rs=>[{...payload,id:'r-'+crypto.randomUUID(),date:new Date().toISOString().slice(0,10)},...rs]);
  setNotice(editor.id?'Review updated.':'Review posted.');setEditor(null);
 }
 function reset(){setReviews(seed);clearFilters();setSort('newest');setCourse('CSEN701');setCourseSearch('');setResetOpen(false);setNotice('Example data restored.');}
 function reviewAction(code){const own=ownReview(code);openEditor(own||null,code);}
 const duplicate = editor && reviews.find(r=>r.id!==editor.id&&r.owner==='you'&&r.courseCode===normalize(editor.courseCode));
 const filterSummary = <div className="active-filters" aria-label="Active review filters"><strong>{view==='mine'?'Your reviews':'All reviews'}</strong>{search.trim()&&<button onClick={()=>setSearch('')}>Search: {search} ×</button>}{rating!=='all'&&<button onClick={()=>setRating('all')}>{rating} stars ×</button>}{!search.trim()&&rating==='all'?<span>No search or rating filters</span>:<button onClick={clearFilters}>Clear filters</button>}</div>;
 function reviewCard(r){return <article className="course-review" key={r.id}>
  {!activeCourseCode&&<a className="course-link" href={`#/courses/${encodeURIComponent(r.courseCode)}`} onClick={courseLink}><strong>{r.courseCode}</strong><small>{getCourse(r.courseCode).name}</small></a>}
  <div className="course-review-top"><strong>{r.name}</strong><span>{stars(r.rating)}</span></div>
  <p>{r.comment||'No comment provided'}</p><div className="course-review-meta"><time dateTime={r.date}>{formatDate(r.date)}</time>{r.owner==='you'&&<button className="row-edit" onClick={()=>openEditor(r)}>Edit your review</button>}</div>
 </article>;}
 return <div className="review-app">
  <a className="skip-link" href="#main-content" onClick={e=>{e.preventDefault();document.getElementById('main-content')?.focus();}}>Skip to content</a>
  <aside className="sidebar"><div className="logo"><span>✦</span> course<span>pulse</span></div>
   <button className="menu-toggle" aria-expanded={menuOpen} aria-controls="primary-navigation" onClick={()=>setMenuOpen(!menuOpen)}>{menuOpen?'Close menu':'Menu ☰'}</button>
   <nav id="primary-navigation" className={menuOpen?'navigation expanded':'navigation'} aria-label="Main navigation">
    <button onClick={home}>Find a course</button>
    <button className={!activeCourseCode&&view==='all'?'active':''} aria-current={!activeCourseCode&&view==='all'?'page':undefined} onClick={()=>browse('all')}>Browse all reviews</button>
    <button className={!activeCourseCode&&view==='mine'?'active':''} aria-current={!activeCourseCode&&view==='mine'?'page':undefined} onClick={()=>browse('mine')}>Your reviews</button>
    <button id="write-review" onClick={()=>openEditor(null)}>＋ Write a review</button>
    <details className="demo-settings"><summary>Demo settings</summary><p>Reset removes your changes and restores the example reviews.</p><button className="danger" onClick={()=>{setMenuOpen(false);setResetOpen(true);}}>Reset demo</button></details>
   </nav>
   <div className="side-end"><div className="badge-face">Y</div><div><strong>Signed in as You</strong><small>Student account</small></div></div>
  </aside>
  <main id="main-content" tabIndex="-1" className="content">
   {notice&&<div className="notice" role="status">{notice}<button aria-label="Dismiss notification" onClick={()=>setNotice('')}>✕</button></div>}
   {storageError&&<p role="alert" className="formerror">{storageError}</p>}
   {activeCourseCode ? <section className="course-detail-page">
    <button className="back-to-reviews" onClick={()=>browse(view)}>← Back to {view==='mine'?'your':'all'} reviews</button>
    <header className="course-hero"><div><p className="eyebrow">COURSE PROFILE</p><h1 id="page-heading" tabIndex="-1">{getCourse(activeCourseCode).name}</h1><p className="course-id">{activeCourseCode}</p><p className="course-description">{getCourse(activeCourseCode).description}</p></div><div className="course-mini-score"><small>COURSE AVERAGE</small><strong>{avg(reviews.filter(r=>r.courseCode===activeCourseCode))} / 5</strong><span>{reviews.filter(r=>r.courseCode===activeCourseCode).length} reviews</span></div></header>
    <div className="course-details-grid"><section className="panel teaching-history"><h2>Teaching history</h2><p>Instructors and teaching assistants for 2024/25 and 2025/26.</p>
     {getCourse(activeCourseCode).history.map(entry=><div className="teaching-entry" key={entry.year}><h3>{entry.year}</h3><div><small>INSTRUCTORS</small><span>{entry.instructors.join(', ')}</span></div><div><small>TEACHING ASSISTANTS</small><span>{entry.tas.join(', ')}</span></div></div>)}
     {!getCourse(activeCourseCode).history.length&&<p>No example teaching records for this course.</p>}<p className="teaching-disclaimer">Illustrative records; staff names are fictional.</p></section>
     <section className="panel course-feedback"><div className="detail-review-head"><h2>Student reviews</h2><button className="post-review" onClick={()=>reviewAction(activeCourseCode)}>{ownReview(activeCourseCode)?'Edit your review':'＋ Write review'}</button></div>
      {reviews.filter(r=>r.courseCode===activeCourseCode).sort((a,b)=>b.date.localeCompare(a.date)).map(reviewCard)}
      {!reviews.some(r=>r.courseCode===activeCourseCode)&&<p>No reviews yet. Be the first to share your experience.</p>}
     </section></div>
   </section> : <>
    <header className="page-head"><div><p className="eyebrow">COURSE FEEDBACK</p><h1 id="page-heading" tabIndex="-1">Find your next course</h1><p>Compare courses, read student experiences, and share your own.</p></div><button className="post-review" onClick={()=>openEditor(null)}>＋ Write review</button></header>
    <section className="panel course-browser"><h2>Compare courses</h2><label htmlFor="course-search">Search courses by name or code</label><input id="course-search" type="search" value={courseSearch} onChange={e=>setCourseSearch(e.target.value)} placeholder="e.g. Linear Algebra or MATH204"/>
     <div className="course-cards">{courseResults.map(code=>{const rs=reviews.filter(r=>r.courseCode===code);return <a className="course-card" key={code} href={`#/courses/${encodeURIComponent(code)}`} onClick={courseLink}><small>{code}</small><h3>{getCourse(code).name}</h3><p><strong>{rs.length?`${avg(rs)} / 5`:'No reviews yet'}</strong><span>{rs.length} {rs.length===1?'review':'reviews'}</span></p></a>;})}</div>
     {!courseResults.length&&<p>No matching courses. <button className="outline" onClick={()=>setCourseSearch('')}>Clear course search</button></p>}
    </section>
    <section className="review-list panel" id="review-list"><div className="panel-head reviews-heading"><div><h2 id="review-heading" tabIndex="-1">{view==='mine'?'Your reviews':'Explore student reviews'}</h2><p>Search by course name, code, comment, or reviewer. Results update as you type.</p></div></div>
     <div className="searchbar"><label className="searchinput">Search reviews<input type="search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Course, comment, or reviewer"/></label><Dropdown label="Rating" value={rating} onChange={setRating} options={[{value:"all",label:"All ratings"},...[5,4,3,2,1].map(n=>({value:String(n),label:`${n} stars`}))]}/><Dropdown label="Sort" value={sort} onChange={setSort} options={[{value:"newest",label:"Newest first"},{value:"highest",label:"Highest rating"},{value:"lowest",label:"Lowest rating"}]}/></div>
     {filterSummary}<p role="status">{result.length} matching {result.length===1?'review':'reviews'}</p>
     {result.length ? <><div className="rows-wrapper"><table><thead><tr>{['Course','Stars','Student comment','Reviewer','Date','Action'].map(h=><th key={h} scope="col">{h}</th>)}</tr></thead><tbody>{result.map(r=><tr key={r.id}><td><a className="course-link" href={`#/courses/${encodeURIComponent(r.courseCode)}`} onClick={courseLink}><strong>{r.courseCode}</strong><small>{getCourse(r.courseCode).name}</small></a></td><td className="ratingcell">{stars(r.rating)}</td><td className="commentcell">{r.comment||'No comment provided'}</td><td>{r.name}</td><td><time dateTime={r.date}>{formatDate(r.date)}</time></td><td>{r.owner==='you'?<button className="row-edit" onClick={()=>openEditor(r)}>Edit</button>:'—'}</td></tr>)}</tbody></table></div><div className="mobile-reviews">{result.map(reviewCard)}</div></> : <div className="empty-state"><p>{view==='mine'?'No reviews of yours match these filters.':'No reviews match these filters.'}</p>{(search.trim()||rating!=='all')&&<button className="outline" onClick={clearFilters}>Clear filters</button>}<button className="post-review" onClick={()=>openEditor(null)}>Write a review</button></div>}
    </section>
    <section className="overview-section" aria-labelledby="overview-heading"><h2 id="overview-heading">Community overview</h2><p>All courses and reviews, independent of the filters above.</p>
     <div className="metrics"><div className="metric"><small>ALL REVIEWS</small><strong>{reviews.length}</strong></div><div className="metric"><small>AVERAGE SCORE</small><strong>{avg(reviews)} <em>/ 5</em></strong></div><div className="metric"><small>COURSES RATED</small><strong>{new Set(reviews.map(r=>r.courseCode)).size}</strong></div></div>
     <div className="analytic-grid"><section className="panel pulse"><h2>Rating distribution</h2><p>All student submissions</p><div className="pulse-content"><div className="donut" aria-hidden="true" style={{background:reviews.length?`conic-gradient(${segments})`:'#e0eeee'}}><div><span>{avg(reviews)}</span><small>AVERAGE</small></div></div><div className="rating-bars">{distribution.map(d=><div key={d.n} className="rating-row"><span>{d.n}★</span><div className="barbg"><i style={{background:d.color,width:`${reviews.length?d.total/reviews.length*100:0}%`}}/></div><small>{d.total} ({reviews.length?Math.round(d.total/reviews.length*100):0}%)</small></div>)}</div></div></section>
      <section className="panel summary"><h2>Course score lookup</h2><Dropdown label="Course code" editable value={course} onChange={setCourse} options={courseOptions} placeholder="Choose or enter a course code"/>{!course.trim()?<p>Enter a course code to see its score.</p>:<><p>{COURSE_CATALOG[normalize(course)]?.name||'Course profile not available'}</p><div className="score"><span>{selected.length?'Average rating':'No reviews yet'}</span><strong>{avg(selected)}</strong><small>{selected.length} reviews</small></div><a className="lookup-course-link" href={`#/courses/${encodeURIComponent(normalize(course))}`} onClick={courseLink}>View course details →</a></>}</section>
     </div>
    </section>
   </>}
  </main>
  {editor&&<Dialog title={editor.id?'Edit review':'Write a course review'} onClose={()=>askDiscard()} initialFocus="#review-course"><form onSubmit={submit} noValidate>
   <p>One review per course. You can edit your review at any time.</p>
   <label htmlFor="review-course">Course code (required)</label><Dropdown id="review-course" editable options={courseOptions} required value={editor.courseCode} onChange={value=>changeField('courseCode',value)} placeholder="Choose or enter a course code" aria-invalid={!!errors.courseCode} aria-describedby={errors.courseCode?'course-help course-error':'course-help'}/>
   <p id="course-help" className="field-help">Choose a suggestion or enter a code not yet in the catalog.</p>
   {errors.courseCode&&<p id="course-error" className="formerror" role="alert">{errors.courseCode}</p>}
   {duplicate&&<p className="duplicate-hint">You already reviewed {duplicate.courseCode}. <button type="button" className="outline" onClick={()=>askDiscard(()=>openEditor(duplicate))}>Edit your existing review</button></p>}
   <fieldset className="star-field" aria-describedby={errors.rating?'rating-help rating-error':'rating-help'} aria-invalid={!!errors.rating}><legend>Overall rating (required)</legend><div className="star-options">{ratingLabels.map((label,i)=><label key={i} className={Number(editor.rating)>=i+1?'star-option selected':'star-option'}><input id={`rating-${i+1}`} type="radio" name="review-rating" required value={i+1} checked={editor.rating===String(i+1)} onChange={e=>changeField('rating',e.target.value)} aria-label={`${i+1} out of 5 — ${label}`} aria-invalid={!!errors.rating} aria-describedby={errors.rating?'rating-help rating-error':'rating-help'}/><span aria-hidden="true">★</span></label>)}</div><p id="rating-help">{editor.rating?`${editor.rating} / 5 — ${ratingLabels[Number(editor.rating)-1]}`:'Choose 1 star (Very poor) to 5 stars (Excellent).'}</p></fieldset>
   {errors.rating&&<p id="rating-error" className="formerror" role="alert">{errors.rating}</p>}
   <label htmlFor="review-comment">Comment (optional)</label><textarea id="review-comment" value={editor.comment} rows={5} onChange={e=>changeField('comment',e.target.value)} placeholder="Share what future students should know"/>
   <div className="modal-actions"><button type="button" onClick={()=>askDiscard()}>Cancel</button><button className="post-review" type="submit">{editor.id?'Save review':'Submit review'}</button></div>
  </form></Dialog>}
  {discardOpen&&<Dialog title="Discard your changes?" onClose={()=>setDiscardOpen(false)} initialFocus="#keep-editing"><p>Your unsaved review changes will be lost.</p><div className="modal-actions"><button id="keep-editing" onClick={()=>setDiscardOpen(false)}>Keep editing</button><button className="danger" onClick={()=>{setDiscardOpen(false);pendingAction.current?.();pendingAction.current=null;}}>Discard changes</button></div></Dialog>}
  {resetOpen&&<Dialog title="Reset demo data?" onClose={()=>setResetOpen(false)} initialFocus="#cancel-reset"><p>This removes all reviews you added and all edits, restoring the nine example reviews. This cannot be undone.</p><div className="modal-actions"><button id="cancel-reset" onClick={()=>setResetOpen(false)}>Cancel</button><button className="danger" onClick={reset}>Restore example data</button></div></Dialog>}
 </div>;
}
