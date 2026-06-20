const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else if (file.endsWith('route.ts')) {
            results.push(file);
        }
    });
    return results;
}

const files = walk('c:/Git/Weir-Here-v1/apps/web/src/app/api/admin');
files.forEach(f => {
    let content = fs.readFileSync(f, 'utf8');
    let changed = false;
    ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].forEach(method => {
        if (content.includes('export async function ' + method + '() {')) {
            content = content.replace('export async function ' + method + '() {', 'export async function ' + method + '(req: NextRequest) {');
            changed = true;
        }
    });
    if (content.includes('requireAdministrator()')) {
        content = content.replace(/requireAdministrator\(\)/g, 'requireAdministrator(req)');
        changed = true;
    }
    
    // Add import for NextRequest if it's missing but we added req: NextRequest
    if (changed && !content.includes('NextRequest')) {
        // If it imports from 'next/server', add NextRequest
        if (content.includes("import { NextResponse } from 'next/server'")) {
            content = content.replace("import { NextResponse } from 'next/server'", "import { NextRequest, NextResponse } from 'next/server'");
        } else if (content.includes("import {NextResponse} from 'next/server'")) {
            content = content.replace("import {NextResponse} from 'next/server'", "import { NextRequest, NextResponse } from 'next/server'");
        } else if (!content.includes('next/server')) {
             content = "import { NextRequest } from 'next/server';\n" + content;
        }
    }
    
    if (changed) {
        fs.writeFileSync(f, content, 'utf8');
        console.log('Fixed ' + f);
    }
});
