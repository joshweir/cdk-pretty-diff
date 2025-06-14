#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { JoshStack } from "./josh-stack";

const app = new cdk.App({
  context: {
    hello: 'you',
  }
});
new JoshStack(app, "JoshStack");
