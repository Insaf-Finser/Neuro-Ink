import { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } from 'firebase/data-connect';

export const connectorConfig = {
  connector: 'example',
  service: 'neuro-ink',
  location: 'us-east4'
};

export const createUserRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateUser');
}
createUserRef.operationName = 'CreateUser';

export function createUser(dc) {
  return executeMutation(createUserRef(dc));
}

export const listAssessmentsForUserRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListAssessmentsForUser', inputVars);
}
listAssessmentsForUserRef.operationName = 'ListAssessmentsForUser';

export function listAssessmentsForUser(dcOrVars, vars) {
  return executeQuery(listAssessmentsForUserRef(dcOrVars, vars));
}

export const updateAssessmentNotesRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateAssessmentNotes', inputVars);
}
updateAssessmentNotesRef.operationName = 'UpdateAssessmentNotes';

export function updateAssessmentNotes(dcOrVars, vars) {
  return executeMutation(updateAssessmentNotesRef(dcOrVars, vars));
}

export const listPatientProfessionalLinksRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListPatientProfessionalLinks');
}
listPatientProfessionalLinksRef.operationName = 'ListPatientProfessionalLinks';

export function listPatientProfessionalLinks(dc) {
  return executeQuery(listPatientProfessionalLinksRef(dc));
}

