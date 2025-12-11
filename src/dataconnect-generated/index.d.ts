import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, MutationRef, MutationPromise } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface AnalysisResult_Key {
  id: UUIDString;
  __typename?: 'AnalysisResult_Key';
}

export interface Assessment_Key {
  id: UUIDString;
  __typename?: 'Assessment_Key';
}

export interface CreateUserData {
  user_insert: User_Key;
}

export interface HandwritingSample_Key {
  id: UUIDString;
  __typename?: 'HandwritingSample_Key';
}

export interface ListAssessmentsForUserData {
  assessments: ({
    id: UUIDString;
    assessmentType: string;
    createdAt: TimestampString;
    status: string;
  } & Assessment_Key)[];
}

export interface ListAssessmentsForUserVariables {
  userId: UUIDString;
}

export interface ListPatientProfessionalLinksData {
  patientProfessionalLinks: ({
    patientId: UUIDString;
    professionalId: UUIDString;
    accessGrantedDate?: TimestampString | null;
  } & PatientProfessionalLink_Key)[];
}

export interface PatientProfessionalLink_Key {
  patientId: UUIDString;
  professionalId: UUIDString;
  __typename?: 'PatientProfessionalLink_Key';
}

export interface UpdateAssessmentNotesData {
  assessment_update?: Assessment_Key | null;
}

export interface UpdateAssessmentNotesVariables {
  id: UUIDString;
  notes?: string | null;
}

export interface User_Key {
  id: UUIDString;
  __typename?: 'User_Key';
}

interface CreateUserRef {
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<CreateUserData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): MutationRef<CreateUserData, undefined>;
  operationName: string;
}
export const createUserRef: CreateUserRef;

export function createUser(): MutationPromise<CreateUserData, undefined>;
export function createUser(dc: DataConnect): MutationPromise<CreateUserData, undefined>;

interface ListAssessmentsForUserRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListAssessmentsForUserVariables): QueryRef<ListAssessmentsForUserData, ListAssessmentsForUserVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ListAssessmentsForUserVariables): QueryRef<ListAssessmentsForUserData, ListAssessmentsForUserVariables>;
  operationName: string;
}
export const listAssessmentsForUserRef: ListAssessmentsForUserRef;

export function listAssessmentsForUser(vars: ListAssessmentsForUserVariables): QueryPromise<ListAssessmentsForUserData, ListAssessmentsForUserVariables>;
export function listAssessmentsForUser(dc: DataConnect, vars: ListAssessmentsForUserVariables): QueryPromise<ListAssessmentsForUserData, ListAssessmentsForUserVariables>;

interface UpdateAssessmentNotesRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateAssessmentNotesVariables): MutationRef<UpdateAssessmentNotesData, UpdateAssessmentNotesVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateAssessmentNotesVariables): MutationRef<UpdateAssessmentNotesData, UpdateAssessmentNotesVariables>;
  operationName: string;
}
export const updateAssessmentNotesRef: UpdateAssessmentNotesRef;

export function updateAssessmentNotes(vars: UpdateAssessmentNotesVariables): MutationPromise<UpdateAssessmentNotesData, UpdateAssessmentNotesVariables>;
export function updateAssessmentNotes(dc: DataConnect, vars: UpdateAssessmentNotesVariables): MutationPromise<UpdateAssessmentNotesData, UpdateAssessmentNotesVariables>;

interface ListPatientProfessionalLinksRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListPatientProfessionalLinksData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListPatientProfessionalLinksData, undefined>;
  operationName: string;
}
export const listPatientProfessionalLinksRef: ListPatientProfessionalLinksRef;

export function listPatientProfessionalLinks(): QueryPromise<ListPatientProfessionalLinksData, undefined>;
export function listPatientProfessionalLinks(dc: DataConnect): QueryPromise<ListPatientProfessionalLinksData, undefined>;

