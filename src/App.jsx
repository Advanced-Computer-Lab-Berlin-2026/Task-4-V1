import React, { useEffect, useMemo, useState } from 'react';

const KEY = 'acl-course-pulse-v2';

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
  description: 'This course does not have an active profile in the example catalog.',
  history: [],
};

const readRoute = () => {
  const match = window.location.hash.match(/^#\/courses\/([^/?#]+)$/);
  return match ? decodeURIComponent(match[1]).toUpperCase() : null;
};

const seed = [
  {id:'r1',courseCode:'CSEN701',rating:4,comment:'A challenging team project. The weekly milestones helped.',owner:'user',name:'You',date:'2026-10-06'},
  {id:'r2',courseCode:'CSEN701',rating:5,comment:'You learn the most when your group communicates well.',owner:'other',name:'Farida',date:'2026-10-02'},
  {id:'r3',courseCode:'MATH204',rating:3,comment:'Useful material but the pace felt fast.',owner:'other',name:'Karim',date:'2026-09-28'},
  {id:'r4',courseCode:'CSEN401',rating:4,comment:'Tutorial exercises are very important.',owner:'user',name:'You',date:'2026-09-24'},
  {id:'r5',courseCode:'HUMA101',rating:5,comment:'Well organized and approachable.',owner:'other',name:'Mariam',date:'2026-09-21'},
  {id:'r6',courseCode:'CSEN701',rating:3,comment:'Good practical work, but demanding during exam week.',owner:'other',name:'Youssef',date:'2026-09-15'},
  {id:'r7',courseCode:'MATH204',rating:5,comment:'Excellent explanation of difficult concepts.',owner:'other',name:'Nadine',date:'2026-08-30'},
  {id:'r8',courseCode:'CSEN401',rating:2,comment:'More worked examples in lectures would help.',owner:'other',name:'Adam',date:'2026-08-17'},
  {id:'r9',courseCode:'CSEN202',rating:4,comment:'The assignments strengthened problem-solving skills.',owner:'other',name:'Hassan',date:'2026-08-09'},
];

function getSaved(){
  try {
    let s = JSON.parse(localStorage.getItem(KEY));
    return Array.isArray(s) ? s : seed;
  } catch {
    return seed;
  }
}

const avg = a => a.length ? (a.reduce((s,r)=>s+r.rating,0)/a.length).toFixed(1) : '—';
const stars = n => '★'.repeat(n) + '☆'.repeat(Math.max(0, 5 - n));

export default function App(){
  const [reviews, setReviews] = useState(getSaved);
  const [search, setSearch] = useState('');
  const [rating, setRating] = useState('all');
  const [filterMine, setFilterMine] = useState(false);
  const [course, setCourse] = useState('CSEN701');
  const [editor, setEditor] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [tab, setTab] = useState('Overview');
  const [activeCourseCode, setActiveCourseCode] = useState(readRoute);

  useEffect(()=>{
    const changePage = () => { setActiveCourseCode(readRoute()); window.scrollTo({top:0, behavior:'instant'}); };
    window.addEventListener('hashchange', changePage);
    return () => window.removeEventListener('hashchange', changePage);
  },[]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if(e.key === 'Escape' && editor) setEditor(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editor]);

  const openCourse = code => {
    window.location.hash = `#/courses/${encodeURIComponent(code)}`;
    setActiveCourseCode(code.toUpperCase());
    window.scrollTo({top:0, behavior:'instant'});
  };

  const navigateTo = (where) => {
    window.location.hash = '#/';
    setActiveCourseCode(null);
    if(where === 'reviews') {
      requestAnimationFrame(() => document.getElementById('review-list')?.scrollIntoView({behavior:'smooth'}));
    } else {
      window.scrollTo({top:0, behavior:'smooth'});
    }
  };

  useEffect(() => localStorage.setItem(KEY, JSON.stringify(reviews)), [reviews]);

  const result = useMemo(() => reviews.filter(r => {
    if(filterMine && r.owner !== 'user') return false;
    if(rating !== 'all' && r.rating !== Number(rating)) return false;
    const query = search.toLowerCase();
    const matchText = `${r.courseCode} ${r.comment} ${r.name} ${getCourse(r.courseCode).name}`.toLowerCase();
    return matchText.includes(query);
  }), [reviews, search, rating, filterMine]);

  const selected = reviews.filter(x => x.courseCode.toUpperCase() === course.trim().toUpperCase());
  const uniqueCourses = [...new Set([...Object.keys(COURSE_CATALOG), ...reviews.map(x => x.courseCode)])];

  const courseSummaries = useMemo(() => {
    return uniqueCourses.map(code => {
      const courseReviews = reviews.filter(r => r.courseCode.toUpperCase() === code.toUpperCase());
      return {
        code,
        name: getCourse(code).name,
        count: courseReviews.length,
        average: avg(courseReviews)
      };
    });
  }, [reviews, uniqueCourses]);

  function openEditor(r, prefillCode = ''){
    if(r && r.owner !== 'user') return;
    setError('');
    setEditor({
      id: r?.id || null, 
      courseCode: r?.courseCode || prefillCode || 'CSEN701', 
      rating: String(r?.rating || ''), 
      comment: r?.comment || ''
    });
  }

  function submit(e){
    e.preventDefault();
    if(!editor.courseCode.trim()){
      setError('Select a valid course code.');
      return;
    }
    if(!/^[1-5]$/.test(editor.rating)){
      setError('Rating must be an integer from 1 to 5.');
      return;
    }

    const normalizedCode = editor.courseCode.trim().toUpperCase();
    const existingUserReview = reviews.find(r => r.id !== editor.id && r.owner === 'user' && r.courseCode.toUpperCase() === normalizedCode);
    if(existingUserReview && !editor.id){
      setError('You have already reviewed this course. You can edit your existing review instead.');
      return;
    }

    const payload = {
      courseCode: normalizedCode,
      rating: Number(editor.rating),
      comment: editor.comment.trim(),
      name: 'You',
      owner: 'user',
      date: new Date().toISOString().slice(0, 10)
    };

    if(editor.id){
      setReviews(reviews.map(r => r.id === editor.id ? {...r, ...payload} : r));
      setNotice('Review successfully updated.');
    } else {
      setReviews([{...payload, id: 'r-'+Date.now()}, ...reviews]);
      setNotice('Review successfully posted.');
    }
    setEditor(null);
  }

  function reset(){
    if(window.confirm('Are you sure you want to reset all data back to the original demo values? Your changes will be lost.')){
      setReviews(seed);
      setSearch('');
      setRating('all');
      setFilterMine(false);
      setCourse('CSEN701');
      setEditor(null);
      setNotice('Example demo data restored successfully.');
    }
  }

  return (
    <div className="review-app">
      <aside className="sidebar">
        <div className="logo"><span>✦</span> course<span>pulse</span></div>
        <div className="side-caption">WORKSPACE</div>
        <button className={tab === 'Overview' && !filterMine ? 'active' : ''} onClick={()=>{ setTab('Overview'); setFilterMine(false); navigateTo('top'); }}><span>▦</span> Overview</button>
        <button className={tab === 'Browse' && !filterMine ? 'active' : ''} onClick={()=>{ setTab('Browse'); setFilterMine(false); navigateTo('reviews'); }}><span>≡</span> Browse reviews</button>
        <button onClick={()=>openEditor(null, activeCourseCode)}><span>＋</span> Write a review</button>
        <div className="side-caption gap">YOUR SPACE</div>
        <button className={filterMine ? 'active' : ''} onClick={()=>{ setFilterMine(true); setTab('Browse'); navigateTo('reviews'); }}><span>♡</span> Your reviews</button>
        <div className="side-end">
          <div className="badge-face">Y</div>
          <div><strong>Your account</strong><small>Student profile</small></div>
        </div>
      </aside>

      <main className="content">
        {notice && <div className="notice" role="status">{notice}<button onClick={()=>setNotice('')}>✕</button></div>}

        {activeCourseCode ? (
          <section className="course-detail-page">
            <button type="button" className="back-to-reviews" onClick={()=>navigateTo('reviews')}>← Back to reviews</button>
            <header className="course-hero">
              <div>
                <p className="eyebrow">COURSE PROFILE</p>
                <h1>{getCourse(activeCourseCode).name}</h1>
                <p className="course-id">{activeCourseCode}</p>
                <p className="course-description">{getCourse(activeCourseCode).description}</p>
              </div>
              <div className="course-mini-score">
                <small>COURSE AVERAGE</small>
                <strong>{avg(reviews.filter(r => r.courseCode.toUpperCase() === activeCourseCode))}</strong>
                <span>{reviews.filter(r => r.courseCode.toUpperCase() === activeCourseCode).length} review(s)</span>
              </div>
            </header>
            
            <div className="course-details-grid">
              <section className="panel teaching-history">
                <h2>Teaching history</h2>
                <p>Instructors and teaching assistants for previous academic years.</p>
                {getCourse(activeCourseCode).history.length ? getCourse(activeCourseCode).history.map(entry => (
                  <div className="teaching-entry" key={entry.year}>
                    <h3>{entry.year}</h3>
                    <div><small>INSTRUCTOR{entry.instructors.length === 1 ? '' : 'S'}</small><span>{entry.instructors.join(', ')}</span></div>
                    <div><small>TEACHING ASSISTANTS</small><span>{entry.tas.join(', ')}</span></div>
                  </div>
                )) : <p className="history-empty">No example teaching records for this course.</p>}
                <p className="teaching-disclaimer">Illustrative course records; staff names are fictional.</p>
              </section>

              <section className="panel course-feedback">
                <div className="detail-review-head">
                  <div>
                    <h2>Student reviews</h2>
                    <p>Feedback for {activeCourseCode}.</p>
                  </div>
                  <button className="post-review" onClick={()=>openEditor(null, activeCourseCode)}>＋ Write review</button>
                </div>
                {reviews.filter(r => r.courseCode.toUpperCase() === activeCourseCode).length ? 
                  reviews.filter(r => r.courseCode.toUpperCase() === activeCourseCode).map(r => (
                    <article className="course-review" key={r.id}>
                      <div className="course-review-top">
                        <strong>{r.name}</strong>
                        <span>{stars(r.rating)}</span>
                      </div>
                      <p>{r.comment || 'No comment provided'}</p>
                      <div className="course-review-meta">
                        <span>{r.date || 'Recent'}</span>
                        {r.owner === 'user' && <button className="row-edit" onClick={()=>openEditor(r)}>Edit your review</button>}
                      </div>
                    </article>
                  )) : <div className="course-review-empty">No reviews for this course yet. Be the first!</div>}
              </section>
            </div>
          </section>
        ) : (
          <>
            <header className="page-head">
              <div>
                <p className="eyebrow">ACADEMIC FEEDBACK PORTAL</p>
                <h1>Course Review Board</h1>
                <p>One place for course feedback, course signals and student opinions.</p>
              </div>
              <button className="post-review" onClick={()=>openEditor(null)}>＋ Write review</button>
            </header>

            <section className="panel course-summary-bar" style={{ marginBottom: '24px' }}>
              <div className="panel-head">
                <div>
                  <h2>Course Ratings & Student Response Summary</h2>
                  <p>Overview of average scores and student participation across all catalog courses</p>
                </div>
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '16px',
                marginTop: '16px'
              }}>
                {courseSummaries.map(item => (
                  <div 
                    key={item.code} 
                    onClick={() => openCourse(item.code)}
                    style={{
                      padding: '16px',
                      background: '#f8fafc',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = '#0284c7'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = '#e2e8f0'}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <strong style={{ fontSize: '14px', color: '#0f172a' }}>{item.code}</strong>
                      <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#0284c7' }}>★ {item.average}</span>
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '8px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.name}
                    </div>
                    <div style={{ fontSize: '11px', fontWeight: '600', color: '#475569' }}>
                      👥 {item.count} {item.count === 1 ? 'student rated' : 'students rated'}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="metrics">
              <div className="metric"><small>ALL REVIEWS</small><strong>{reviews.length}</strong><span>Community contributions</span></div>
              <div className="metric"><small>AVERAGE SCORE</small><strong>{avg(reviews)} <em>/ 5</em></strong><span>Calculated across entries</span></div>
              <div className="metric"><small>COURSES RATED</small><strong>{uniqueCourses.length}</strong><span>Catalog courses</span></div>
            </section>

            <div className="analytic-grid">
              <section className="panel summary" style={{ gridColumn: '1 / -1' }}>
                <div className="panel-head">
                  <div>
                    <h2>Quick course lookup</h2>
                    <p>Select or inspect any course rating.</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginTop: '12px' }}>
                  <label style={{ flex: 1, margin: 0 }}>
                    <select value={course} onChange={e=>setCourse(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                      {uniqueCourses.map(code => (
                        <option key={code} value={code}>{code} - {getCourse(code).name}</option>
                      ))}
                    </select>
                  </label>
                  <div className="score" style={{ margin: 0, padding: '8px 16px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <span>Rating: <strong>{avg(selected)}</strong></span>
                    <small>({selected.length} student reviews)</small>
                  </div>
                  {course.trim() && (
                    <button type="button" className="lookup-course-link" onClick={()=>openCourse(course.trim())} style={{ margin: 0 }}>
                      View course details →
                    </button>
                  )}
                </div>
              </section>
            </div>

            <section className="review-list panel" id="review-list" style={{ marginTop: '24px' }}>
              <div className="panel-head reviews-heading">
                <div>
                  <h2>{filterMine ? 'Your submitted reviews' : 'Explore student reviews'}</h2>
                  <p>{filterMine ? 'Managing your personal course feedback entries.' : 'Find a comment by course name, code, rating or student.'}</p>
                </div>
                <button className="outline" onClick={reset}>Reset demo</button>
              </div>
              
              <div className="searchbar">
                <div className="searchinput">
                  <span>⌕</span>
                  <input value={search} onChange={e=>setSearch(e.target.value)} aria-label="Search reviews" placeholder="Search by course name, code, or comment..."/>
                </div>
                <label><span>Rating</span>
                  <select value={rating} onChange={e=>setRating(e.target.value)}>
                    <option value="all">All ratings</option>
                    {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} stars</option>)}
                  </select>
                </label>
                {filterMine && (
                  <button className="outline" onClick={()=>setFilterMine(false)}>Clear "Your Reviews" filter</button>
                )}
              </div>

              <div className="rows-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Course</th>
                      <th>Stars</th>
                      <th>Student comment</th>
                      <th>Reviewer</th>
                      <th>Date</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.map(r => (
                      <tr key={r.id}>
                        <td>
                          <button type="button" className="course-link" title={`View ${getCourse(r.courseCode).name}`} onClick={()=>openCourse(r.courseCode)}>
                            <strong>{r.courseCode}</strong>
                            <small>{getCourse(r.courseCode).name}</small>
                          </button>
                        </td>
                        <td className="ratingcell">{stars(r.rating)}</td>
                        <td className="commentcell">{r.comment || 'No comment provided'}</td>
                        <td>{r.name}</td>
                        <td>{r.date || 'Recent'}</td>
                        <td>
                          {r.owner === 'user' ? (
                            <button className="row-edit" onClick={()=>openEditor(r)}>Edit</button>
                          ) : (
                            <span className="dim">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {result.length === 0 && (
                      <tr>
                        <td colSpan="6" style={{textAlign: 'center', padding: '32px'}}>
                          <p><strong>No reviews found matching your criteria.</strong></p>
                          <p style={{fontSize: '12px', color: '#666', marginTop: '4px'}}>Try clearing your search filters or resetting view parameters.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <p className="tablefoot">{result.length} of {reviews.length} reviews • Campus feedback platform</p>
            </section>
          </>
        )}
      </main>

      {editor && (
        <div className="overlay" onMouseDown={e => e.target === e.currentTarget && setEditor(null)}>
          <div className="modal" role="dialog" aria-modal="true" aria-label={editor.id ? 'Edit review' : 'Write review'}>
            <div className="modal-title">
              <div>
                <p className="eyebrow">YOUR CONTRIBUTION</p>
                <h2>{editor.id ? 'Edit review' : 'Write a course review'}</h2>
                <p>Share a rating and a short comment.</p>
              </div>
              <button onClick={()=>setEditor(null)} aria-label="Close">✕</button>
            </div>
            <form onSubmit={submit}>
              {/* COURSE CODE DROPDOWN SELECT INSTEAD OF TEXT INPUT */}
              <label>Course code
                <select 
                  value={editor.courseCode} 
                  onChange={e=>setEditor(s=>({...s, courseCode: e.target.value}))}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '14px' }}
                >
                  {Object.keys(COURSE_CATALOG).map(code => (
                    <option key={code} value={code}>
                      {code} — {COURSE_CATALOG[code].name}
                    </option>
                  ))}
                </select>
              </label>
              
              <label>Overall rating
                <select value={editor.rating} onChange={e=>setEditor(s=>({...s, rating: e.target.value}))}>
                  <option value="">Choose score</option>
                  {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </label>
              <label>Comment
                <textarea value={editor.comment} rows={5} onChange={e=>setEditor(s=>({...s, comment: e.target.value}))} placeholder="Comment (optional)"/>
              </label>
              {error && <div className="formerror" role="alert">{error}</div>}
              <div className="modal-actions">
                <button type="button" onClick={()=>setEditor(null)}>Cancel</button>
                <button className="post-review" type="submit">{editor.id ? 'Save review' : 'Submit review'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}