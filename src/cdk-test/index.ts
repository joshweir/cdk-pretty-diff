#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { JoshStack } from "./josh-stack";

export const app = new cdk.App();
export const stack = new JoshStack(app, "JoshStack");
