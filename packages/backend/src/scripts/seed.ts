import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { User } from '../models/User.model';
import { Student } from '../models/Student.model';
import { Teacher } from '../models/Teacher.model';
import { Class } from '../models/Class.model';
import { UserRole, Gender } from '../types';
import connectDB from '../config/database';

dotenv.config();

const seedDatabase = async (): Promise<void> => {
  try {
    await connectDB();

    // Clear existing data
    await User.deleteMany({});
    await Class.deleteMany({});

    console.log('🗑️  Cleared existing data...');

    // Hash password
    const hashedPassword = await bcrypt.hash('password123', 12);

    // Create Principal (insert directly to avoid discriminator requirement)
    await User.collection.insertOne({
      email: 'principal@school.com',
      password: hashedPassword,
      role: UserRole.PRINCIPAL,
      phone: '9876543210',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log('✅ Principal created');

    // Create Teachers with all required fields
    const teachers = await Teacher.create([
      {
        email: 'teacher1@school.com',
        password: hashedPassword,
        role: UserRole.TEACHER,
        teacherId: 'TCH1001',
        fullName: 'Rajesh Kumar',
        qualification: 'M.Sc, B.Ed',
        specialization: ['Mathematics', 'Physics'],
        subjects: ['Mathematics', 'Physics'],
        employmentType: 'permanent',
        experience: 8,
        phone: '9876543211',
        address: '123 Teacher Colony',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        emergencyContact: '9876543211',
        joiningDate: new Date('2020-06-01'),
        assignedClasses: [],
      },
      {
        email: 'teacher2@school.com',
        password: hashedPassword,
        role: UserRole.TEACHER,
        teacherId: 'TCH1002',
        fullName: 'Priya Sharma',
        qualification: 'M.A, B.Ed',
        specialization: ['English', 'Social Studies'],
        subjects: ['English', 'Social Studies'],
        employmentType: 'permanent',
        experience: 5,
        phone: '9876543212',
        address: '456 Teacher Apartments',
        city: 'Delhi',
        state: 'Delhi',
        pincode: '110001',
        emergencyContact: '9876543212',
        joiningDate: new Date('2021-06-01'),
        assignedClasses: [],
      },
      {
        email: 'teacher3@school.com',
        password: hashedPassword,
        role: UserRole.TEACHER,
        teacherId: 'TCH1003',
        fullName: 'Amit Patel',
        qualification: 'M.Sc, B.Ed',
        specialization: ['Science', 'Computer Science'],
        subjects: ['Science', 'Computer Science'],
        employmentType: 'contract',
        experience: 3,
        phone: '9876543213',
        address: '789 Teacher Lane',
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560001',
        emergencyContact: '9876543213',
        joiningDate: new Date('2022-06-01'),
        assignedClasses: [],
      },
    ]);

    console.log('✅ Teachers created');

    // Create Classes
    const currentYear = new Date().getFullYear();
    const academicYear = `${currentYear}-${currentYear + 1}`;

    const classes = await Class.create([
      {
        className: '10',
        sections: ['A', 'B', 'C'],
        classTeacher: teachers[0]._id,
        subjects: [
          { name: 'Mathematics', teacher: teachers[0]._id },
          { name: 'Science', teacher: teachers[2]._id },
          { name: 'English', teacher: teachers[1]._id },
          { name: 'Social Studies', teacher: teachers[1]._id },
          { name: 'Computer Science', teacher: teachers[2]._id },
        ],
        academicYear,
        capacity: 40,
      },
      {
        className: '9',
        sections: ['A', 'B'],
        classTeacher: teachers[1]._id,
        subjects: [
          { name: 'Mathematics', teacher: teachers[0]._id },
          { name: 'Science', teacher: teachers[2]._id },
          { name: 'English', teacher: teachers[1]._id },
          { name: 'Social Studies', teacher: teachers[1]._id },
          { name: 'Hindi', teacher: teachers[1]._id },
        ],
        academicYear,
        capacity: 40,
      },
      {
        className: '8',
        sections: ['A', 'B', 'C'],
        classTeacher: teachers[2]._id,
        subjects: [
          { name: 'Mathematics', teacher: teachers[0]._id },
          { name: 'Science', teacher: teachers[2]._id },
          { name: 'English', teacher: teachers[1]._id },
          { name: 'Social Studies', teacher: teachers[1]._id },
          { name: 'Computer Science', teacher: teachers[2]._id },
        ],
        academicYear,
        capacity: 40,
      },
    ]);

    console.log('✅ Classes created');

    // Update teachers with assigned classes
    teachers[0].assignedClasses.push(
      { class: classes[0]._id, section: 'A', subject: 'Mathematics' },
      { class: classes[1]._id, section: 'A', subject: 'Mathematics' }
    );
    
    teachers[1].assignedClasses.push(
      { class: classes[0]._id, section: 'A', subject: 'English' },
      { class: classes[1]._id, section: 'A', subject: 'English' },
      { class: classes[2]._id, section: 'A', subject: 'English' }
    );
    
    teachers[2].assignedClasses.push(
      { class: classes[0]._id, section: 'A', subject: 'Science' },
      { class: classes[1]._id, section: 'A', subject: 'Science' },
      { class: classes[2]._id, section: 'A', subject: 'Science' }
    );
    
    await Promise.all(teachers.map(teacher => teacher.save()));
    console.log('✅ Teachers assigned to classes');

    // Create Students for Class 10
    const class10Students = [];
    for (let i = 1; i <= 20; i++) {
      const rollNumber = i;
      const studentId = `STU${currentYear.toString().slice(2)}${rollNumber.toString().padStart(4, '0')}`;
      const section = i <= 7 ? 'A' : i <= 14 ? 'B' : 'C';

      class10Students.push({
        email: `student10_${i}@school.com`,
        password: hashedPassword,
        role: UserRole.STUDENT,
        studentId,
        fullName: `Student 10-${i}`,
        dateOfBirth: new Date(2008, 0, i),
        gender: i % 2 === 0 ? Gender.MALE : Gender.FEMALE,
        address: `${i} Student Street`,
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        parentName: `Parent ${i}`,
        parentEmail: `parent10_${i}@gmail.com`,
        parentPhone: `98765${i.toString().padStart(5, '0')}`,
        emergencyContact: `98765${(i+20).toString().padStart(5, '0')}`,
        class: classes[0]._id,
        section,
        rollNumber,
        admissionDate: new Date(2022, 3, 1),
        transportRequired: i % 3 === 0,
        busRoute: i % 3 === 0 ? `Route-${i % 5}` : undefined,
      });
    }

    await Student.create(class10Students);
    console.log('✅ 20 students created for Class 10');

    // Create Students for Class 9
    const class9Students = [];
    for (let i = 1; i <= 15; i++) {
      const rollNumber = i;
      const studentId = `STU${currentYear.toString().slice(2)}${(20 + i).toString().padStart(4, '0')}`;
      const section = i <= 8 ? 'A' : 'B';

      class9Students.push({
        email: `student9_${i}@school.com`,
        password: hashedPassword,
        role: UserRole.STUDENT,
        studentId,
        fullName: `Student 9-${i}`,
        dateOfBirth: new Date(2009, 0, i),
        gender: i % 2 === 0 ? Gender.MALE : Gender.FEMALE,
        address: `${i} Student Avenue`,
        city: 'Delhi',
        state: 'Delhi',
        pincode: '110001',
        parentName: `Parent 9-${i}`,
        parentEmail: `parent9_${i}@gmail.com`,
        parentPhone: `98766${i.toString().padStart(5, '0')}`,
        emergencyContact: `98766${(i+20).toString().padStart(5, '0')}`,
        class: classes[1]._id,
        section,
        rollNumber,
        admissionDate: new Date(2023, 3, 1),
        transportRequired: i % 4 === 0,
        busRoute: i % 4 === 0 ? `Route-${i % 4}` : undefined,
      });
    }

    await Student.create(class9Students);
    console.log('✅ 15 students created for Class 9');

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('=================================');
    console.log('Principal:');
    console.log('  Email: principal@school.com');
    console.log('  Password: password123');
    console.log('\nTeachers:');
    console.log('  Email: teacher1@school.com (Rajesh Kumar)');
    console.log('  Email: teacher2@school.com (Priya Sharma)');
    console.log('  Email: teacher3@school.com (Amit Patel)');
    console.log('  Password: password123 (for all teachers)');
    console.log('\nSample Students:');
    console.log('  Email: student10_1@school.com (Class 10-A)');
    console.log('  Email: student9_1@school.com (Class 9-A)');
    console.log('  Password: password123 (for all students)');
    console.log('=================================');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

// Run seed if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

export default seedDatabase;