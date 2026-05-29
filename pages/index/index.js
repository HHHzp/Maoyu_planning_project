const STORAGE_KEY = 'planbook:v1'
const CHECKIN_STORAGE_KEY = 'planbook:checkins:v1'
const HEATMAP_WEEKS = 26

const periods = [
  { key: 'day', label: '日' },
  { key: 'week', label: '周' },
  { key: 'month', label: '月' },
  { key: 'year', label: '年' }
]

const placeholders = {
  day: '给今天加一件事',
  week: '给本周加一个推进项',
  month: '给本月加一个目标',
  year: '给今年加一个方向'
}

const weekdayLabels = [
  { id: 'mon', label: '一' },
  { id: 'tue', label: '' },
  { id: 'wed', label: '三' },
  { id: 'thu', label: '' },
  { id: 'fri', label: '五' },
  { id: 'sat', label: '' },
  { id: 'sun', label: '' }
]

const legendLevels = [0, 1, 2, 3, 4]

function pad(value) {
  return String(value).padStart(2, '0')
}

function toDateKey(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function startOfWeek(date) {
  const next = new Date(date)
  const day = next.getDay() || 7
  next.setDate(next.getDate() - day + 1)
  next.setHours(0, 0, 0, 0)
  return next
}

function addByPeriod(date, period, step) {
  const next = new Date(date)

  if (period === 'day') {
    next.setDate(next.getDate() + step)
  }

  if (period === 'week') {
    next.setDate(next.getDate() + step * 7)
  }

  if (period === 'month') {
    next.setMonth(next.getMonth() + step)
  }

  if (period === 'year') {
    next.setFullYear(next.getFullYear() + step)
  }

  return next
}

function getPeriodKey(date, period) {
  if (period === 'day') {
    return `day:${toDateKey(date)}`
  }

  if (period === 'week') {
    return `week:${toDateKey(startOfWeek(date))}`
  }

  if (period === 'month') {
    return `month:${date.getFullYear()}-${pad(date.getMonth() + 1)}`
  }

  return `year:${date.getFullYear()}`
}

function formatRange(date, period) {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()

  if (period === 'day') {
    return {
      title: `${year}年${month}月${day}日`,
      hint: '每日计划与记录'
    }
  }

  if (period === 'week') {
    const start = startOfWeek(date)
    const end = new Date(start)
    end.setDate(start.getDate() + 6)
    return {
      title: `${start.getMonth() + 1}月${start.getDate()}日 - ${end.getMonth() + 1}月${end.getDate()}日`,
      hint: `${start.getFullYear()}年第 ${getWeekNumber(start)} 周`
    }
  }

  if (period === 'month') {
    return {
      title: `${year}年${month}月`,
      hint: '月度目标与复盘'
    }
  }

  return {
    title: `${year}年`,
    hint: '年度方向与记录'
  }
}

function getWeekNumber(date) {
  const start = new Date(date.getFullYear(), 0, 1)
  const diff = date - start + (start.getTimezoneOffset() - date.getTimezoneOffset()) * 60000
  const oneDay = 86400000
  return Math.ceil((diff / oneDay + start.getDay() + 1) / 7)
}

function formatDateLabel(date) {
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
}

function getHeatmapLevel(count, checked) {
  if (count >= 4) return 4
  if (count >= 3) return 3
  if (count >= 2) return 2
  if (count >= 1 || checked) return 1
  return 0
}

function buildHeatmap(checkins, store) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const start = startOfWeek(today)
  start.setDate(start.getDate() - (HEATMAP_WEEKS - 1) * 7)

  const weeks = []
  let previousMonth = -1

  for (let weekIndex = 0; weekIndex < HEATMAP_WEEKS; weekIndex += 1) {
    const weekStart = new Date(start)
    weekStart.setDate(start.getDate() + weekIndex * 7)

    const days = []
    for (let dayIndex = 0; dayIndex < 7; dayIndex += 1) {
      const current = new Date(weekStart)
      current.setDate(weekStart.getDate() + dayIndex)
      const dateKey = toDateKey(current)
      const checked = Boolean(checkins[dateKey])
      const dayEntry = store[`day:${dateKey}`] || {}
      const plans = dayEntry.plans || []
      const completedCount = plans.filter((plan) => plan.done).length

      days.push({
        dateKey,
        checked,
        count: completedCount,
        level: getHeatmapLevel(completedCount, checked),
        label: formatDateLabel(current)
      })
    }

    const month = weekStart.getMonth()
    const shouldShowMonth = weekIndex === 0 || month !== previousMonth
    previousMonth = month

    weeks.push({
      id: `${weekStart.getFullYear()}-${weekStart.getMonth()}-${weekStart.getDate()}`,
      monthLabel: shouldShowMonth ? `${month + 1}月` : '',
      monthOffset: `${weekIndex * 28}rpx`,
      days
    })
  }

  return weeks
}

function countCurrentStreak(checkins) {
  const cursor = new Date()
  cursor.setHours(0, 0, 0, 0)

  let count = 0
  while (checkins[toDateKey(cursor)]) {
    count += 1
    cursor.setDate(cursor.getDate() - 1)
  }

  return count
}

Page({
  data: {
    periods,
    activePeriod: 'day',
    cursorTime: Date.now(),
    rangeTitle: '',
    rangeHint: '',
    placeholder: placeholders.day,
    draftPlan: '',
    plans: [],
    record: '',
    doneCount: 0,
    openCount: 0,
    progress: 0,
    store: {},
    checkins: {},
    checkinDateLabel: '',
    isCheckedIn: false,
    checkinCount: 0,
    streakCount: 0,
    weekdayLabels,
    legendLevels,
    heatmapWeeks: []
  },

  onLoad() {
    const store = wx.getStorageSync(STORAGE_KEY) || {}
    const checkins = wx.getStorageSync(CHECKIN_STORAGE_KEY) || {}
    this.setData({ store, checkins })
    this.refreshView()
  },

  switchPeriod(event) {
    this.setData({
      activePeriod: event.currentTarget.dataset.key,
      draftPlan: ''
    })
    this.refreshView()
  },

  goPrev() {
    this.setData({
      cursorTime: addByPeriod(this.getCursorDate(), this.data.activePeriod, -1).getTime()
    })
    this.refreshView()
  },

  goNext() {
    this.setData({
      cursorTime: addByPeriod(this.getCursorDate(), this.data.activePeriod, 1).getTime()
    })
    this.refreshView()
  },

  jumpToday() {
    this.setData({ cursorTime: Date.now() })
    this.refreshView()
  },

  onPlanInput(event) {
    this.setData({ draftPlan: event.detail.value })
  },

  addPlan() {
    const text = this.data.draftPlan.trim()
    if (!text) return

    const entry = this.getCurrentEntry()
    entry.plans.unshift({
      id: `${Date.now()}`,
      text,
      done: false,
      createdAt: new Date().toISOString()
    })

    this.saveEntry(entry)
    this.setData({ draftPlan: '' })
    this.refreshView()
  },

  togglePlan(event) {
    const id = event.currentTarget.dataset.id
    const entry = this.getCurrentEntry()
    entry.plans = entry.plans.map((plan) => ({
      ...plan,
      done: plan.id === id ? !plan.done : plan.done
    }))

    this.saveEntry(entry)
    this.refreshView()
  },

  deletePlan(event) {
    const id = event.currentTarget.dataset.id
    const entry = this.getCurrentEntry()
    entry.plans = entry.plans.filter((plan) => plan.id !== id)

    this.saveEntry(entry)
    this.refreshView()
  },

  onRecordInput(event) {
    const entry = this.getCurrentEntry()
    entry.record = event.detail.value
    this.saveEntry(entry)
    this.setData({ record: entry.record })
  },

  toggleCheckin() {
    const dateKey = toDateKey(this.getCursorDate())
    const checkins = { ...this.data.checkins }

    if (checkins[dateKey]) {
      delete checkins[dateKey]
    } else {
      checkins[dateKey] = {
        checkedAt: new Date().toISOString()
      }
    }

    wx.setStorageSync(CHECKIN_STORAGE_KEY, checkins)
    this.setData({ checkins })
    this.refreshView()
  },

  getCursorDate() {
    return new Date(this.data.cursorTime)
  },

  getCurrentKey() {
    return getPeriodKey(this.getCursorDate(), this.data.activePeriod)
  },

  getCurrentEntry() {
    const key = this.getCurrentKey()
    const current = this.data.store[key] || {}
    return {
      plans: current.plans || [],
      record: current.record || ''
    }
  },

  saveEntry(entry) {
    const key = this.getCurrentKey()
    const store = {
      ...this.data.store,
      [key]: entry
    }

    wx.setStorageSync(STORAGE_KEY, store)
    this.setData({ store })
  },

  refreshView() {
    const entry = this.getCurrentEntry()
    const doneCount = entry.plans.filter((plan) => plan.done).length
    const openCount = entry.plans.length - doneCount
    const progress = entry.plans.length ? Math.round((doneCount / entry.plans.length) * 100) : 0
    const range = formatRange(this.getCursorDate(), this.data.activePeriod)
    const cursorDate = this.getCursorDate()
    const dateKey = toDateKey(cursorDate)
    const checkinKeys = Object.keys(this.data.checkins)

    this.setData({
      rangeTitle: range.title,
      rangeHint: range.hint,
      placeholder: placeholders[this.data.activePeriod],
      plans: entry.plans,
      record: entry.record,
      doneCount,
      openCount,
      progress,
      checkinDateLabel: formatDateLabel(cursorDate),
      isCheckedIn: Boolean(this.data.checkins[dateKey]),
      checkinCount: checkinKeys.length,
      streakCount: countCurrentStreak(this.data.checkins),
      heatmapWeeks: buildHeatmap(this.data.checkins, this.data.store)
    })
  }
})
