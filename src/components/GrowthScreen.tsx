import { Plus, Scale, Sprout } from 'lucide-react'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatDate, poundsToOunces } from '../data'
import { useCopy } from '../i18n'
import type { Entry, Language } from '../types'

export function GrowthScreen({ language, entries, onAdd }: { language: Language, entries: Entry[], onAdd: () => void }) {
  const t = useCopy(language)
  const weights = entries.filter(e => e.kind === 'weight').sort((a,b) => a.date.localeCompare(b.date))
  const chart = weights.map(e => ({ date: formatDate(e.date, language), value: +(poundsToOunces(e.title)/16).toFixed(2) }))
  const latest = weights[weights.length - 1]?.title || '6 lb 10 oz'
  return <div className="screen growth-screen">
    <section className="screen-intro botanical"><h1>{t.growthTitle}</h1><p>{t.growthCopy}</p></section>
    <div className="growth-summary"><div><span><Scale/></span><small>{t.currentWeight}</small><strong>{latest}</strong></div><div><span><Sprout/></span><small>{t.birthWeight}</small><strong>2 lb</strong></div></div>
    <section className="growth-chart"><header><h2>{t.weightJourney}</h2></header><div className="chart-area"><ResponsiveContainer width="100%" height="100%"><AreaChart data={chart} margin={{top:20,right:12,left:-22,bottom:4}}><defs><linearGradient id="growthFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#82927a" stopOpacity=".28"/><stop offset="1" stopColor="#82927a" stopOpacity=".02"/></linearGradient></defs><CartesianGrid vertical={false} stroke="#eee7e1"/><XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize:11,fill:'#777279'}}/><YAxis domain={['dataMin - .5','dataMax + .5']} axisLine={false} tickLine={false} tick={{fontSize:11,fill:'#777279'}}/><Tooltip formatter={(value:number) => [`${value} lb`, t.weight]} contentStyle={{borderRadius:12,borderColor:'#e9ded7'}}/><Area dataKey="value" type="monotone" stroke="#6f826b" strokeWidth={3} fill="url(#growthFill)" dot={{r:4,fill:'#6f826b',stroke:'#fff',strokeWidth:2}}/></AreaChart></ResponsiveContainer></div></section>
    <p className="gentle-note"><Sprout/>{t.noPressure}</p>
    <button className="primary-action" onClick={onAdd}><Scale/><Plus/>{t.addWeight}</button>
  </div>
}
