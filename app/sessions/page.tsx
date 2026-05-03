import Link from 'next/link';

const SESSIONS_DATA = [
  { title: 'The Beginning', date: '21 March', speaker: 'Karthik Nagapuri', linkedin: 'https://www.linkedin.com/in/karthiknagpuri/', image: 'session1.jpg', tag: 'Introductions & Goals', description: 'Our journey started with introductions, goals, startup ideas, and the first spark of turning thoughts into real systems.' },
  { title: 'AI Foundations', date: '31 March', speaker: 'Meet Desai', linkedin: 'https://www.linkedin.com/in/meetdesai13?utm_source=share_via&utm_content=profile&utm_medium=member_android', image: 'session2.jpg', tag: 'AI & Emerging Tech', description: 'An interactive session where we explored the fundamentals of AI development and future technologies shaping the industry.' },
  { title: 'Design Thinking', date: '7 April', speaker: 'Sai Santhosh Madhari', linkedin: 'https://www.linkedin.com/in/saisantoshmadhari0711?utm_source=share_via&utm_content=profile&utm_medium=member_android', image: 'session3.jpg', tag: 'Design & Creativity', description: 'A session that helped us understand design, its types, and how good design makes ideas more meaningful.' },
  { title: 'Agentic AI & Tools', date: '8 April', speaker: 'Konrad Gnat', linkedin: 'https://www.linkedin.com/in/konrad-gnat?utm_source=share_via&utm_content=profile&utm_medium=member_android', image: 'session4.jpg', tag: 'Agentic AI', description: 'We explored Agentic AI, AI tools, and modern tech for web development.' },
  { title: 'Entrepreneurship Reality Check', date: '12 April', speaker: 'Deepak Rai', linkedin: 'https://www.linkedin.com/in/deepakrai9?utm_source=share_via&utm_content=profile&utm_medium=member_android', image: 'session5.jpg', tag: 'Startup Challenges', description: 'A practical session on entrepreneurship, challenges founders face, and how to overcome them.' },
  { title: 'Content Creation Mindset', date: '12 April', speaker: 'Shivam Rai Sir', linkedin: 'https://www.linkedin.com/in/1809shivamrai?utm_source=share_via&utm_content=profile&utm_medium=member_android', image: 'session6.jpg', tag: 'Brand & Content', description: 'A lively session on getting started with content creation, thinking uniquely, and building a strong personal brand.' },
  { title: 'Frontend, Backend & AI Tools', date: '24 April', speaker: 'Anand Reddy K S', linkedin: 'https://www.linkedin.com/in/anandreddyks?utm_source=share_via&utm_content=profile&utm_medium=member_android', image: 'session7.jpg', tag: 'Tech Implementation', description: 'We understood frontend, backend, SQL, NoSQL, AI tools, and how to build impactful projects by solving real user problems.' },
];

export default function Sessions() {
  return (
    <>
      <div className="journey-hero reveal-up">
        <span className="mini-title">Our Journey</span>
        <h1>Every session shapes the founder.</h1>
      </div>

      <div className="journey-tabs reveal-up">
        {SESSIONS_DATA.map((s, i) => (
          <div key={i} className="journey-tab">{s.tag}</div>
        ))}
      </div>

      <div className="journey-timeline">
        {SESSIONS_DATA.map((s, i) => (
          <div key={i} className="session-card stagger-in">
            <div className="session-image-box">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/static/images/${s.image}`} alt={s.title} />
              <div className="session-tag">{s.tag}</div>
            </div>
            <div className="session-content">
              <span className="session-date">{s.date}</span>
              <h2>{s.title}</h2>
              <p>{s.description}</p>
              
              <div className="speaker-box">
                <div>
                  <small>Speaker / Guide</small>
                  <h3>{s.speaker}</h3>
                </div>
                {s.linkedin && (
                  <Link href={s.linkedin} target="_blank" className="linkedin-btn">
                    Connect ↗
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
