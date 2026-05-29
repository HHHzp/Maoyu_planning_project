# Maoyu Plan

A clean WeChat Mini Program for personal planning, journaling, and habit tracking. It helps users plan by day, week, month, and year, record reflections, and review consistency through a GitHub-style activity heatmap.

## Overview

Maoyu Plan is a lightweight personal planning tool for time management and goal tracking. It is not meant to be a heavy project management system. Instead, it works like a simple daily planbook: write down plans for the current period, mark tasks as done, leave notes or reflections, and use the heatmap to see recent activity at a glance.

## Features

- Daily, weekly, monthly, and yearly planning views
- Navigate between time periods and quickly jump back to today
- Add plans, mark them as complete, and delete them
- Save independent reflection notes for each period
- Daily check-in and check-out support
- GitHub-style heatmap for the latest 26 weeks
- Five heatmap intensity levels based on completed task count
- Automatic total check-in count and current streak count
- Local data storage with WeChat Mini Program storage APIs
- No backend required; import and run directly

## Screenshots

Place preview images in `docs/images/`. GitHub will render them below.

<p align="center">
  <img src="docs/images/home.png" alt="Home screen" width="240" />
</p>

<p align="center">
  <img src="docs/images/heatmap.png" alt="Check-in heatmap" width="240" />
</p>

## Project Structure

```text
.
├── app.js
├── app.json
├── app.wxss
├── pages
│   └── index
│       ├── index.js
│       ├── index.json
│       ├── index.wxml
│       └── index.wxss
├── project.config.json
├── sitemap.json
└── README.md
```

## Getting Started

1. Install and open WeChat Developer Tools.
2. Choose "Import Project".
3. Select the root directory of this repository.
4. Use your own Mini Program AppID, a test AppID, or tourist mode.
5. Click "Compile" to preview the app.

## Data Storage

The current version stores data locally through WeChat Mini Program storage:

- `planbook:v1`: plans and reflection notes for day, week, month, and year views
- `planbook:checkins:v1`: daily check-in data

Local storage is suitable for prototypes and single-device personal use. For multi-device sync, the app can later be connected to WeChat Cloud Development or a custom backend.

## Design Direction

The interface focuses on low-friction planning, clear hierarchy, and quick recording:

- The top area shows the current period, completion progress, and task stats
- The planning section keeps task input and the task list close together
- The check-in section provides visible feedback for continuous action
- The notes section gives users a quiet space for reflection

## Roadmap

- Add task priority, tags, and categories
- Add reminder time and subscription messages
- Add reflection templates, such as "What was completed / What got stuck / Next step"
- Add a Today dashboard that summarizes yearly, monthly, weekly, and daily priorities
- Support cloud sync and multi-device usage
- Add data export

## License

No license has been specified yet. If this project is opened for collaboration, consider adding the MIT License or another suitable open source license.
