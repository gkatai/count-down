import config from '../config.json'
import { makeClassifier, parseISO, toISO, workdaysLeft, type Config } from './workdays'
import './App.css'

const cfg = config as Config
const classify = makeClassifier(cfg)

function Month({ year, month, today }: { year: number; month: number; today: Date }) {
  const first = new Date(year, month, 1)
  const offset = (first.getDay() + 6) % 7 // Monday-first
  const days = new Date(year, month + 1, 0).getDate()
  const end = parseISO(cfg.targetDate)
  return (
    <section className="month">
      <h3>{first.toLocaleString('en', { month: 'long', year: 'numeric' })}</h3>
      <div className="grid">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => <b key={i}>{d}</b>)}
        {Array.from({ length: offset }, (_, i) => <span key={'e' + i} />)}
        {Array.from({ length: days }, (_, i) => {
          const d = new Date(year, month, i + 1)
          const { kind, label } = classify(d)
          const cls = [kind, toISO(d) === toISO(today) && 'today', d < today && 'past', d > end && 'past'].filter(Boolean).join(' ')
          return <span key={i} className={'day ' + cls} title={label}>{i + 1}</span>
        })}
      </div>
    </section>
  )
}

function App() {
  const today = new Date()
  const left = workdaysLeft(cfg, today)
  const end = parseISO(cfg.targetDate)
  const months: { y: number; m: number }[] = []
  for (let d = new Date(today.getFullYear(), today.getMonth(), 1); d <= end; d = new Date(d.getFullYear(), d.getMonth() + 1, 1))
    months.push({ y: d.getFullYear(), m: d.getMonth() })

  return (
    <main>
      <div className="big">{left}</div>
      <p className="sub">{today > end ? 'Done 🎉' : `workdays left until ${cfg.targetDate}`}</p>
      <div className="months">
        {months.map(({ y, m }) => <Month key={`${y}-${m}`} year={y} month={m} today={today} />)}
      </div>
    </main>
  )
}

export default App
