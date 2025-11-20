export interface IUser {
    _id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: 'admin' | 'employee' | 'client';
    phone?: string;
    avatar?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export interface IProject {
    _id: string;
    title: string;
    description: string;
    clientId: string;
    projectType: string;
    priority: 'low' | 'medium' | 'high';
    status: 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled';
    tags: string[];
    estimatedHours: number;
    startDate: Date;
    endDate: Date;
    createdAt: Date;
    updatedAt: Date;
}
export interface IClient {
    _id: string;
    name: string;
    type: string;
    email: string;
    phone?: string;
    contactPerson?: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface IUpdate {
    _id: string;
    projectId: string;
    employeeId: string;
    date: Date;
    summary: string;
    checklist: Array<{
        task: string;
        completed: boolean;
    }>;
    nextPlan: string;
    attachments: Array<{
        fileName: string;
        fileUrl: string;
        uploadedAt: Date;
    }>;
    createdAt: Date;
    updatedAt: Date;
}
export interface AuthPayload {
    id: string;
    email: string;
    role: string;
}
//# sourceMappingURL=index.d.ts.map