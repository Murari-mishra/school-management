# School MIS — monorepo

 USER ROLES & PERMISSIONS
1. Principal (Admin)
•	 Full access to all features
•	 Create/Edit/Delete users (Students, Teachers)
•	 Manage classes and sections
•	 View all attendance records
•	 Generate reports and analytics
•	 System configuration

2. Teacher
•	 View assigned classes
•	 Mark attendance for their classes
•	 View student profiles in their classes
•	 Add discipline/behavior records
•	 Search students in their classes
•	 Cannot manage users/classes

3. Student
•	 View personal dashboard
•	 Check own attendance
•	 View timetable (future)
•	 See personal remarks
•	 Cannot access admin/teacher features



taken help from AI to work on this project 
school-mis/
├── packages/
│   ├── backend/              # Node.js + Express + TypeScript Backend
│   │   ├── src/
│   │   │   ├── config/       # Environment & DB configuration
│   │   │   ├── models/       # MongoDB Schemas
│   │   │   ├── controllers/  # Business logic
│   │   │   ├── routes/       # API Routes
│   │   │   ├── middleware/   # Auth & Error handlers
│   │   │   ├── services/     # Business services
│   │   │   ├── utils/        # Helper functions
│   │   │   ├── types/        # TypeScript types
│   │   │   ├── scripts/      # Database seeding
│   │   │   ├── app.ts        # Express app setup
│   │   │   └── server.ts     # Server entry point
│   │   ├── .env             # Environment variables
│   │   ├── package.json     # Backend dependencies
│   │   └── tsconfig.json    # TypeScript config
│   │
│   └── frontend/            # React + TypeScript Frontend
│       ├── src/
│       │   ├── components/   # Reusable UI components
│       │   │   ├── common/   # Navbar, Sidebar, etc.
│       │   │   └── layout/   # Layout components
│       │   ├── pages/        # Page components
│       │   ├── hooks/        # Custom React hooks
│       │   ├── context/      # React Context (Auth)
│       │   ├── services/     # API service calls
│       │   ├── types/        # TypeScript interfaces
│       │   ├── utils/        # Helper functions
│       │   ├── styles/       # CSS/Tailwind config
│       │   ├── assets/       # Images, icons
│       │   ├── App.tsx       # Main App component
│       │   └── main.tsx      # Entry point
│       ├── public/          # Static files
│       ├── tailwind.config.js # Tailwind CSS config
│       ├── vite.config.ts   # Vite build config
│       ├── .env            # Frontend env variables
│       └── package.json    # Frontend dependencies
│
├── package.json            # Monorepo root config
└── README.md              # Project documentation


Access Application:
•	Frontend: http://localhost:3000
•	Backend API: http://localhost:5001/api
•	API Health: http://localhost:5001/api/health


