#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cdk = require("aws-cdk-lib");
const josh_stack_1 = require("./josh-stack");
const app = new cdk.App({
    context: {
        hello: 'you',
    }
});
new josh_stack_1.JoshStack(app, "JoshStack");
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY2RrLXRlc3QvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQ0EsbUNBQW1DO0FBQ25DLDZDQUF5QztBQUV6QyxNQUFNLEdBQUcsR0FBRyxJQUFJLEdBQUcsQ0FBQyxHQUFHLENBQUM7SUFDdEIsT0FBTyxFQUFFO1FBQ1AsS0FBSyxFQUFFLEtBQUs7S0FDYjtDQUNGLENBQUMsQ0FBQztBQUNILElBQUksc0JBQVMsQ0FBQyxHQUFHLEVBQUUsV0FBVyxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIjIS91c3IvYmluL2VudiBub2RlXG5pbXBvcnQgKiBhcyBjZGsgZnJvbSBcImF3cy1jZGstbGliXCI7XG5pbXBvcnQgeyBKb3NoU3RhY2sgfSBmcm9tIFwiLi9qb3NoLXN0YWNrXCI7XG5cbmNvbnN0IGFwcCA9IG5ldyBjZGsuQXBwKHtcbiAgY29udGV4dDoge1xuICAgIGhlbGxvOiAneW91JyxcbiAgfVxufSk7XG5uZXcgSm9zaFN0YWNrKGFwcCwgXCJKb3NoU3RhY2tcIik7XG4iXX0=