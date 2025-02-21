import test from "node:test";
import { NewFileScanner } from "./writers/NewFileScanner";
import { testProfiles } from './config/testProfiles';

const result = NewFileScanner.scanTestFile("./tests/crm.spec.ts");
const appName = "CRM";
const profile = testProfiles[appName];

//////////////////////////////
console.log("Starting file scan...");

// imports
NewFileScanner.logExistingImports("./tests/crm.spec.ts");
console.log(profile.imports);