import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import * as XLSX from "xlsx";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import chromium from "@sparticuz/chromium-min";
import puppeteer from "puppeteer-core";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function launchBrowser() {
    const isProd = !!process.env.VERCEL_ENV;

    if (isProd) {
        return await puppeteer.launch({
            args: chromium.args,
            executablePath: await chromium.executablePath(),
            headless: true,
        });
    }

    const fullPuppeteer = await import("puppeteer");
    return await fullPuppeteer.default.launch({
        headless: true, // fixes Puppeteer v21+ headless mode warning
        args: [],
    });
}

export async function POST(req: NextRequest) {
    const { url } = await req.json();
    if (!url) {
        return NextResponse.json({ error: "No URL provided" }, { status: 400 });
    }

    const downloadDir = path.join(process.cwd(), "tmp-downloads");
    if (!fs.existsSync(downloadDir)) {
        fs.mkdirSync(downloadDir);
    }

    const browser = await launchBrowser();
    const page = await browser.newPage();

    try {
        await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });

        const client = await page.createCDPSession();
        await client.send("Page.setDownloadBehavior", {
            behavior: "allow",
            downloadPath: downloadDir,
        });

        await page.click("#exportButton");

        // Wait up to 10s and check for .xlsx file repeatedly
        let tries = 0;
        const maxTries = 10;
        let downloadedFile = null;

        while (tries < maxTries) {
            await new Promise((res) => setTimeout(res, 1000));
            const files = fs
                .readdirSync(downloadDir)
                .filter((f) => /\.xlsx?$/i.test(f))
                .map((f) => ({
                    f,
                    mtime: fs.statSync(path.join(downloadDir, f)).mtimeMs,
                }))
                .sort((a, b) => b.mtime - a.mtime);

            if (files.length > 0) {
                downloadedFile = path.join(downloadDir, files[0].f);
                break;
            }

            tries++;
        }

        if (!downloadedFile) {
            throw new Error("Download failed: no .xlsx files found");
        }

        const fileBuffer = fs.readFileSync(downloadedFile);
        const checksum = crypto.createHash("sha256").update(fileBuffer).digest("hex");

        const { data: exists } = await supabase
            .from("mandi_prices")
            .select("id")
            .eq("checksum", checksum)
            .limit(1);

        if (exists?.length) {
            await browser.close();
            fs.unlinkSync(downloadedFile);
            return NextResponse.json({ message: "Already imported" });
        }

        const workbook = XLSX.read(fileBuffer, { type: "buffer" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet);

        const mandiRows = (rows as any[]).map((r) => {
            const commodity = r["Commodity"]?.toString().trim();
            if (!commodity) return null; // Skip rows without required field

            return {
                checksum,
                commodity,
                variety: r["Variety"]?.toString().trim() || null,
                market: r["Mandi / Market"]?.toString().trim() || null,
                state: r["State"]?.toString().trim() || null,
                district: r["District"]?.toString().trim() || null,
                min_price: r["Min Price"] ? parseFloat(r["Min Price"]) : null,
                modal_price: r["Modal Price"] ? parseFloat(r["Modal Price"]) : null,
                max_price: r["Max Price"] ? parseFloat(r["Max Price"]) : null,
                arrival_date: new Date(), // or parse from Excel if available
            };
        }).filter(Boolean);

        await supabase.from("mandi_prices").insert(mandiRows);

        fs.unlinkSync(downloadedFile);
        await browser.close();

        return NextResponse.json({
            message: `Imported ${mandiRows.length} mandi rows`,
        });
    } catch (err: any) {
        await browser.close();
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
