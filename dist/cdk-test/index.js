#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stack = exports.app = void 0;
const cdk = require("aws-cdk-lib");
const josh_stack_1 = require("./josh-stack");
exports.app = new cdk.App({
    context: {
        hello: 'you',
    }
});
exports.stack = new josh_stack_1.JoshStack(exports.app, "JoshStack");
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY2RrLXRlc3QvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztBQUNBLG1DQUFtQztBQUNuQyw2Q0FBeUM7QUFFNUIsUUFBQSxHQUFHLEdBQUcsSUFBSSxHQUFHLENBQUMsR0FBRyxDQUFDO0lBQzdCLE9BQU8sRUFBRTtRQUNQLEtBQUssRUFBRSxLQUFLO0tBQ2I7Q0FDRixDQUFDLENBQUM7QUFDVSxRQUFBLEtBQUssR0FBRyxJQUFJLHNCQUFTLENBQUMsV0FBRyxFQUFFLFdBQVcsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiIyEvdXNyL2Jpbi9lbnYgbm9kZVxuaW1wb3J0ICogYXMgY2RrIGZyb20gXCJhd3MtY2RrLWxpYlwiO1xuaW1wb3J0IHsgSm9zaFN0YWNrIH0gZnJvbSBcIi4vam9zaC1zdGFja1wiO1xuXG5leHBvcnQgY29uc3QgYXBwID0gbmV3IGNkay5BcHAoe1xuICBjb250ZXh0OiB7XG4gICAgaGVsbG86ICd5b3UnLFxuICB9XG59KTtcbmV4cG9ydCBjb25zdCBzdGFjayA9IG5ldyBKb3NoU3RhY2soYXBwLCBcIkpvc2hTdGFja1wiKTtcbiJdfQ==