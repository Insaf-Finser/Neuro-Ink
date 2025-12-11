import { CreateUserData, ListAssessmentsForUserData, ListAssessmentsForUserVariables, UpdateAssessmentNotesData, UpdateAssessmentNotesVariables, ListPatientProfessionalLinksData } from '../';
import { UseDataConnectQueryResult, useDataConnectQueryOptions, UseDataConnectMutationResult, useDataConnectMutationOptions} from '@tanstack-query-firebase/react/data-connect';
import { UseQueryResult, UseMutationResult} from '@tanstack/react-query';
import { DataConnect } from 'firebase/data-connect';
import { FirebaseError } from 'firebase/app';


export function useCreateUser(options?: useDataConnectMutationOptions<CreateUserData, FirebaseError, void>): UseDataConnectMutationResult<CreateUserData, undefined>;
export function useCreateUser(dc: DataConnect, options?: useDataConnectMutationOptions<CreateUserData, FirebaseError, void>): UseDataConnectMutationResult<CreateUserData, undefined>;

export function useListAssessmentsForUser(vars: ListAssessmentsForUserVariables, options?: useDataConnectQueryOptions<ListAssessmentsForUserData>): UseDataConnectQueryResult<ListAssessmentsForUserData, ListAssessmentsForUserVariables>;
export function useListAssessmentsForUser(dc: DataConnect, vars: ListAssessmentsForUserVariables, options?: useDataConnectQueryOptions<ListAssessmentsForUserData>): UseDataConnectQueryResult<ListAssessmentsForUserData, ListAssessmentsForUserVariables>;

export function useUpdateAssessmentNotes(options?: useDataConnectMutationOptions<UpdateAssessmentNotesData, FirebaseError, UpdateAssessmentNotesVariables>): UseDataConnectMutationResult<UpdateAssessmentNotesData, UpdateAssessmentNotesVariables>;
export function useUpdateAssessmentNotes(dc: DataConnect, options?: useDataConnectMutationOptions<UpdateAssessmentNotesData, FirebaseError, UpdateAssessmentNotesVariables>): UseDataConnectMutationResult<UpdateAssessmentNotesData, UpdateAssessmentNotesVariables>;

export function useListPatientProfessionalLinks(options?: useDataConnectQueryOptions<ListPatientProfessionalLinksData>): UseDataConnectQueryResult<ListPatientProfessionalLinksData, undefined>;
export function useListPatientProfessionalLinks(dc: DataConnect, options?: useDataConnectQueryOptions<ListPatientProfessionalLinksData>): UseDataConnectQueryResult<ListPatientProfessionalLinksData, undefined>;
