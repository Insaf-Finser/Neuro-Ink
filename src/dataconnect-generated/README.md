# Generated TypeScript README
This README will guide you through the process of using the generated JavaScript SDK package for the connector `example`. It will also provide examples on how to use your generated SDK to call your Data Connect queries and mutations.

**If you're looking for the `React README`, you can find it at [`dataconnect-generated/react/README.md`](./react/README.md)**

***NOTE:** This README is generated alongside the generated SDK. If you make changes to this file, they will be overwritten when the SDK is regenerated.*

# Table of Contents
- [**Overview**](#generated-javascript-readme)
- [**Accessing the connector**](#accessing-the-connector)
  - [*Connecting to the local Emulator*](#connecting-to-the-local-emulator)
- [**Queries**](#queries)
  - [*ListAssessmentsForUser*](#listassessmentsforuser)
  - [*ListPatientProfessionalLinks*](#listpatientprofessionallinks)
- [**Mutations**](#mutations)
  - [*CreateUser*](#createuser)
  - [*UpdateAssessmentNotes*](#updateassessmentnotes)

# Accessing the connector
A connector is a collection of Queries and Mutations. One SDK is generated for each connector - this SDK is generated for the connector `example`. You can find more information about connectors in the [Data Connect documentation](https://firebase.google.com/docs/data-connect#how-does).

You can use this generated SDK by importing from the package `@dataconnect/generated` as shown below. Both CommonJS and ESM imports are supported.

You can also follow the instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#set-client).

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
```

## Connecting to the local Emulator
By default, the connector will connect to the production service.

To connect to the emulator, you can use the following code.
You can also follow the emulator instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#instrument-clients).

```typescript
import { connectDataConnectEmulator, getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
connectDataConnectEmulator(dataConnect, 'localhost', 9399);
```

After it's initialized, you can call your Data Connect [queries](#queries) and [mutations](#mutations) from your generated SDK.

# Queries

There are two ways to execute a Data Connect Query using the generated Web SDK:
- Using a Query Reference function, which returns a `QueryRef`
  - The `QueryRef` can be used as an argument to `executeQuery()`, which will execute the Query and return a `QueryPromise`
- Using an action shortcut function, which returns a `QueryPromise`
  - Calling the action shortcut function will execute the Query and return a `QueryPromise`

The following is true for both the action shortcut function and the `QueryRef` function:
- The `QueryPromise` returned will resolve to the result of the Query once it has finished executing
- If the Query accepts arguments, both the action shortcut function and the `QueryRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Query
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each query. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-queries).

## ListAssessmentsForUser
You can execute the `ListAssessmentsForUser` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listAssessmentsForUser(vars: ListAssessmentsForUserVariables): QueryPromise<ListAssessmentsForUserData, ListAssessmentsForUserVariables>;

interface ListAssessmentsForUserRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListAssessmentsForUserVariables): QueryRef<ListAssessmentsForUserData, ListAssessmentsForUserVariables>;
}
export const listAssessmentsForUserRef: ListAssessmentsForUserRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listAssessmentsForUser(dc: DataConnect, vars: ListAssessmentsForUserVariables): QueryPromise<ListAssessmentsForUserData, ListAssessmentsForUserVariables>;

interface ListAssessmentsForUserRef {
  ...
  (dc: DataConnect, vars: ListAssessmentsForUserVariables): QueryRef<ListAssessmentsForUserData, ListAssessmentsForUserVariables>;
}
export const listAssessmentsForUserRef: ListAssessmentsForUserRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listAssessmentsForUserRef:
```typescript
const name = listAssessmentsForUserRef.operationName;
console.log(name);
```

### Variables
The `ListAssessmentsForUser` query requires an argument of type `ListAssessmentsForUserVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ListAssessmentsForUserVariables {
  userId: UUIDString;
}
```
### Return Type
Recall that executing the `ListAssessmentsForUser` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListAssessmentsForUserData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListAssessmentsForUserData {
  assessments: ({
    id: UUIDString;
    assessmentType: string;
    createdAt: TimestampString;
    status: string;
  } & Assessment_Key)[];
}
```
### Using `ListAssessmentsForUser`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listAssessmentsForUser, ListAssessmentsForUserVariables } from '@dataconnect/generated';

// The `ListAssessmentsForUser` query requires an argument of type `ListAssessmentsForUserVariables`:
const listAssessmentsForUserVars: ListAssessmentsForUserVariables = {
  userId: ..., 
};

// Call the `listAssessmentsForUser()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listAssessmentsForUser(listAssessmentsForUserVars);
// Variables can be defined inline as well.
const { data } = await listAssessmentsForUser({ userId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listAssessmentsForUser(dataConnect, listAssessmentsForUserVars);

console.log(data.assessments);

// Or, you can use the `Promise` API.
listAssessmentsForUser(listAssessmentsForUserVars).then((response) => {
  const data = response.data;
  console.log(data.assessments);
});
```

### Using `ListAssessmentsForUser`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listAssessmentsForUserRef, ListAssessmentsForUserVariables } from '@dataconnect/generated';

// The `ListAssessmentsForUser` query requires an argument of type `ListAssessmentsForUserVariables`:
const listAssessmentsForUserVars: ListAssessmentsForUserVariables = {
  userId: ..., 
};

// Call the `listAssessmentsForUserRef()` function to get a reference to the query.
const ref = listAssessmentsForUserRef(listAssessmentsForUserVars);
// Variables can be defined inline as well.
const ref = listAssessmentsForUserRef({ userId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listAssessmentsForUserRef(dataConnect, listAssessmentsForUserVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.assessments);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.assessments);
});
```

## ListPatientProfessionalLinks
You can execute the `ListPatientProfessionalLinks` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listPatientProfessionalLinks(): QueryPromise<ListPatientProfessionalLinksData, undefined>;

interface ListPatientProfessionalLinksRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListPatientProfessionalLinksData, undefined>;
}
export const listPatientProfessionalLinksRef: ListPatientProfessionalLinksRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listPatientProfessionalLinks(dc: DataConnect): QueryPromise<ListPatientProfessionalLinksData, undefined>;

interface ListPatientProfessionalLinksRef {
  ...
  (dc: DataConnect): QueryRef<ListPatientProfessionalLinksData, undefined>;
}
export const listPatientProfessionalLinksRef: ListPatientProfessionalLinksRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listPatientProfessionalLinksRef:
```typescript
const name = listPatientProfessionalLinksRef.operationName;
console.log(name);
```

### Variables
The `ListPatientProfessionalLinks` query has no variables.
### Return Type
Recall that executing the `ListPatientProfessionalLinks` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListPatientProfessionalLinksData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListPatientProfessionalLinksData {
  patientProfessionalLinks: ({
    patientId: UUIDString;
    professionalId: UUIDString;
    accessGrantedDate?: TimestampString | null;
  } & PatientProfessionalLink_Key)[];
}
```
### Using `ListPatientProfessionalLinks`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listPatientProfessionalLinks } from '@dataconnect/generated';


// Call the `listPatientProfessionalLinks()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listPatientProfessionalLinks();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listPatientProfessionalLinks(dataConnect);

console.log(data.patientProfessionalLinks);

// Or, you can use the `Promise` API.
listPatientProfessionalLinks().then((response) => {
  const data = response.data;
  console.log(data.patientProfessionalLinks);
});
```

### Using `ListPatientProfessionalLinks`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listPatientProfessionalLinksRef } from '@dataconnect/generated';


// Call the `listPatientProfessionalLinksRef()` function to get a reference to the query.
const ref = listPatientProfessionalLinksRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listPatientProfessionalLinksRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.patientProfessionalLinks);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.patientProfessionalLinks);
});
```

# Mutations

There are two ways to execute a Data Connect Mutation using the generated Web SDK:
- Using a Mutation Reference function, which returns a `MutationRef`
  - The `MutationRef` can be used as an argument to `executeMutation()`, which will execute the Mutation and return a `MutationPromise`
- Using an action shortcut function, which returns a `MutationPromise`
  - Calling the action shortcut function will execute the Mutation and return a `MutationPromise`

The following is true for both the action shortcut function and the `MutationRef` function:
- The `MutationPromise` returned will resolve to the result of the Mutation once it has finished executing
- If the Mutation accepts arguments, both the action shortcut function and the `MutationRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Mutation
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each mutation. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-mutations).

## CreateUser
You can execute the `CreateUser` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createUser(): MutationPromise<CreateUserData, undefined>;

interface CreateUserRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<CreateUserData, undefined>;
}
export const createUserRef: CreateUserRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createUser(dc: DataConnect): MutationPromise<CreateUserData, undefined>;

interface CreateUserRef {
  ...
  (dc: DataConnect): MutationRef<CreateUserData, undefined>;
}
export const createUserRef: CreateUserRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createUserRef:
```typescript
const name = createUserRef.operationName;
console.log(name);
```

### Variables
The `CreateUser` mutation has no variables.
### Return Type
Recall that executing the `CreateUser` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateUserData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateUserData {
  user_insert: User_Key;
}
```
### Using `CreateUser`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createUser } from '@dataconnect/generated';


// Call the `createUser()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createUser();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createUser(dataConnect);

console.log(data.user_insert);

// Or, you can use the `Promise` API.
createUser().then((response) => {
  const data = response.data;
  console.log(data.user_insert);
});
```

### Using `CreateUser`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createUserRef } from '@dataconnect/generated';


// Call the `createUserRef()` function to get a reference to the mutation.
const ref = createUserRef();

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createUserRef(dataConnect);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.user_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.user_insert);
});
```

## UpdateAssessmentNotes
You can execute the `UpdateAssessmentNotes` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
updateAssessmentNotes(vars: UpdateAssessmentNotesVariables): MutationPromise<UpdateAssessmentNotesData, UpdateAssessmentNotesVariables>;

interface UpdateAssessmentNotesRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateAssessmentNotesVariables): MutationRef<UpdateAssessmentNotesData, UpdateAssessmentNotesVariables>;
}
export const updateAssessmentNotesRef: UpdateAssessmentNotesRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateAssessmentNotes(dc: DataConnect, vars: UpdateAssessmentNotesVariables): MutationPromise<UpdateAssessmentNotesData, UpdateAssessmentNotesVariables>;

interface UpdateAssessmentNotesRef {
  ...
  (dc: DataConnect, vars: UpdateAssessmentNotesVariables): MutationRef<UpdateAssessmentNotesData, UpdateAssessmentNotesVariables>;
}
export const updateAssessmentNotesRef: UpdateAssessmentNotesRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateAssessmentNotesRef:
```typescript
const name = updateAssessmentNotesRef.operationName;
console.log(name);
```

### Variables
The `UpdateAssessmentNotes` mutation requires an argument of type `UpdateAssessmentNotesVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdateAssessmentNotesVariables {
  id: UUIDString;
  notes?: string | null;
}
```
### Return Type
Recall that executing the `UpdateAssessmentNotes` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateAssessmentNotesData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateAssessmentNotesData {
  assessment_update?: Assessment_Key | null;
}
```
### Using `UpdateAssessmentNotes`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateAssessmentNotes, UpdateAssessmentNotesVariables } from '@dataconnect/generated';

// The `UpdateAssessmentNotes` mutation requires an argument of type `UpdateAssessmentNotesVariables`:
const updateAssessmentNotesVars: UpdateAssessmentNotesVariables = {
  id: ..., 
  notes: ..., // optional
};

// Call the `updateAssessmentNotes()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateAssessmentNotes(updateAssessmentNotesVars);
// Variables can be defined inline as well.
const { data } = await updateAssessmentNotes({ id: ..., notes: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateAssessmentNotes(dataConnect, updateAssessmentNotesVars);

console.log(data.assessment_update);

// Or, you can use the `Promise` API.
updateAssessmentNotes(updateAssessmentNotesVars).then((response) => {
  const data = response.data;
  console.log(data.assessment_update);
});
```

### Using `UpdateAssessmentNotes`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateAssessmentNotesRef, UpdateAssessmentNotesVariables } from '@dataconnect/generated';

// The `UpdateAssessmentNotes` mutation requires an argument of type `UpdateAssessmentNotesVariables`:
const updateAssessmentNotesVars: UpdateAssessmentNotesVariables = {
  id: ..., 
  notes: ..., // optional
};

// Call the `updateAssessmentNotesRef()` function to get a reference to the mutation.
const ref = updateAssessmentNotesRef(updateAssessmentNotesVars);
// Variables can be defined inline as well.
const ref = updateAssessmentNotesRef({ id: ..., notes: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateAssessmentNotesRef(dataConnect, updateAssessmentNotesVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.assessment_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.assessment_update);
});
```

