#!/usr/bin/env node
import * as cdk from "@aws-cdk/core";
import { JoshStack } from "./josh-stack";

const app = new cdk.App();
new JoshStack(app, "JoshStack");
