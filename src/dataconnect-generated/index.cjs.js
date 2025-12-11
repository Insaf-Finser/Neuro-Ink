const { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'example',
  service: 'neuro-ink',
  location: 'us-east4'
};
exports.connectorConfig = connectorConfig;

const createUserRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateUser');
}
createUserRef.operationName = 'CreateUser';
exports.createUserRef = createUserRef;

exports.createUser = function createUser(dc) {
  return executeMutation(createUserRef(dc));
};

const listAssessmentsForUserRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListAssessmentsForUser', inputVars);
}
listAssessmentsForUserRef.operationName = 'ListAssessmentsForUser';
exports.listAssessmentsForUserRef = listAssessmentsForUserRef;

exports.listAssessmentsForUser = function listAssessmentsForUser(dcOrVars, vars) {
  return executeQuery(listAssessmentsForUserRef(dcOrVars, vars));
};

const updateAssessmentNotesRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateAssessmentNotes', inputVars);
}
updateAssessmentNotesRef.operationName = 'UpdateAssessmentNotes';
exports.updateAssessmentNotesRef = updateAssessmentNotesRef;

exports.updateAssessmentNotes = function updateAssessmentNotes(dcOrVars, vars) {
  return executeMutation(updateAssessmentNotesRef(dcOrVars, vars));
};

const listPatientProfessionalLinksRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListPatientProfessionalLinks');
}
listPatientProfessionalLinksRef.operationName = 'ListPatientProfessionalLinks';
exports.listPatientProfessionalLinksRef = listPatientProfessionalLinksRef;

exports.listPatientProfessionalLinks = function listPatientProfessionalLinks(dc) {
  return executeQuery(listPatientProfessionalLinksRef(dc));
};
