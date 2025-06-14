#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stack = exports.app = void 0;
const cdk = require("aws-cdk-lib");
const josh_stack_1 = require("./josh-stack");
exports.app = new cdk.App();
exports.stack = new josh_stack_1.JoshStack(exports.app, "JoshStack");
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY2RrLXRlc3QvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztBQUNBLG1DQUFtQztBQUNuQyw2Q0FBeUM7QUFFNUIsUUFBQSxHQUFHLEdBQUcsSUFBSSxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUM7QUFDcEIsUUFBQSxLQUFLLEdBQUcsSUFBSSxzQkFBUyxDQUFDLFdBQUcsRUFBRSxXQUFXLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIiMhL3Vzci9iaW4vZW52IG5vZGVcbmltcG9ydCAqIGFzIGNkayBmcm9tIFwiYXdzLWNkay1saWJcIjtcbmltcG9ydCB7IEpvc2hTdGFjayB9IGZyb20gXCIuL2pvc2gtc3RhY2tcIjtcblxuZXhwb3J0IGNvbnN0IGFwcCA9IG5ldyBjZGsuQXBwKCk7XG5leHBvcnQgY29uc3Qgc3RhY2sgPSBuZXcgSm9zaFN0YWNrKGFwcCwgXCJKb3NoU3RhY2tcIik7XG4iXX0=
