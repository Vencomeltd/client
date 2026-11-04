# VenCome build resume, 4 November 2026

Source: `C:/Users/user/Downloads/VenCome-Build-Spec-31-Oct-2026.md`, Claude's 1 November session, both repositories and fresh checks.

## Exact stopping point

The server feature branch was merged in server PR #16. The client is still on `feature/build-spec-31-oct`, with sections 1 to 9 committed. Section 10 has an HTML sample only, at `vencome-server/docs/invoice-preview.html`.

Claude finished the non-destructive preview checks it could do. It stopped before setting up the private Documents bucket and testing a minimum-term lease with an active QA listing. It also needed account identities before flagging team accounts or removing Daniel's account.

The older vault master backlog is not a reliable completion list for this build. Several items marked unstarted there are implemented in these branches.

## Verified on 4 November

- All 94 server tests pass with a placeholder Stripe key for constructor initialisation. Database/payment operations in the relevant tests use stubs. The first run without that key failed to initialise the admin-users suite, rather than failing a user-count assertion.
- The private `vencome-documents` bucket returns 404 using the configured R2 credentials.
- The Cloudflare dashboard in Chrome requires sign-in.
- Claude's preview loads, including the new homepage contact block. Its application sign-in is no longer present.
- Merged `origin/main` into the client feature branch so it includes the new terms from PR #28. The unrelated local `.env`, `.gitignore` and `ProtectedRoute.jsx` edits were preserved.

## Remaining walkthrough

| Section | Code state | Remaining acceptance checks |
| --- | --- | --- |
| 1. VAT, utilities and commission | Implemented, pricing tests pass | QA listing: ex-VAT, inc-VAT and no-VAT options. Compare calculator, card, booking panel and checkout totals. Verify request/confirmation/invoice output in a controlled test. Confirm commission-base choice before changing its default. |
| 2. Listing flow and leases | Implemented, lease tests pass | Use an active QA listing with a 12-month minimum. Check monthly quote, commitment and first payment before any payment submission. Later test monthly charge/retry and cancellation rules with payment stubs or a test-mode environment. |
| 3. Users | Implemented, count/reminder tests pass | Verify row flags and exclusion toggles in the admin UI. Obtain exact team/Internal account identities and Daniel's identity before changes. |
| 4. Listings | Implemented, previously preview-checked | Recheck status counts, creator, full draft detail, No photos and VAT status filters. Claude already deleted the empty Vencom Ltd draft. Do not repeat that deletion. |
| 5. Communications | Implemented, email template tests pass | Recheck filters/calendar/scheduled tab, template preview/reset and variables. Confirm booking opening hours. A test email requires a known recipient and approved test workflow. Do not send the held password broadcast. |
| 6. Host identity | Implemented | Check business-name/first-name/Host fallback, incomplete-profile banner and customer-message recipient using QA accounts. |
| 7. Page tidy-ups | Implemented | Check the blog contact block and homepage contact actions on desktop and mobile. |
| 8. Site content | Implemented, Claude tested publish/reset/history | Check remaining page groups and SEO fields. Preserve public text when testing. |
| 9. Documents and backups | Implemented, export/restore unit tests pass | Create private R2 bucket, verify existing key access, configure Render bucket name. Test upload, signed download, folder zip, rename/move/search and audited deletion with an approved disposable file. Test full/CSV export and restore dry-run. Do not run a production restore. Check mirror timestamps and weekly export retention. |
| 10. Invoice | HTML sample only | Get client approval and registered London address before implementing the PDF. The new supplied terms give company number 17182804, but address and design approval remain outstanding. |

## Release gates

- Keep client changes on preview until the remaining checks pass. The server is already deployed.
- Use Chrome for preview testing, as requested in Claude's saved workflow.
- Do not change a real host listing to test leases. Use an agreed QA listing or an isolated local fixture.
- The production API charges real cards. Stop before payment unless a specific test transaction is authorised.
- The new terms were a publication change. Their commission, cancellation, deposit and occupation rules need a separate comparison against this older build spec. Do not silently reinterpret money or existing bookings.

## Next action

Continue the remaining acceptance checks using only Empty Content Creator Room, an agent-created test listing, or wholly synthetic local data. Invoice PDF implementation remains held for client approval and the registered address.

## Continuation after sign-in, 4 November

- Created `vencome-documents` in the existing Cloudflare account. Public Access is Disabled. Existing S3 credentials can access it without permission changes.
- Set `R2_DOCUMENTS_BUCKET=vencome-documents` on Render and used Save and deploy. Render deployment `dep-dblftcbbc2fs73e5tt80` is Live, using existing server commit `a3fe733`.
- Tested the storage adapter upload/signed download with disposable content, then removed its temporary object.
- Tested admin upload and signed download of `QA-storage-check-2026-11-04.txt`. Download matches byte for byte. Confirmed the admin-uploaded object is in the private bucket. Download all as ZIP also contains the intact sample. The admin sample remains for inspection. No customer documents were changed.
- Database mirror status says connection details are missing (`BACKUP_MIRROR_URIS`). No mirror configuration or production restore was attempted.
- Tested the lease form using a local fixture with all mutation requests blocked. No active public listing has a minimum term, so no live listing was modified. For the spec example, core is GBP724.50, VAT GBP144.90, first month GBP869.40, and 12-month total GBP10,432.80. Increasing to 13 months yields GBP11,302.20. The minimum decrease control is disabled at 12 months.
- Found and fixed a customer-facing headline that showed the stored ex-VAT amount above the correct gross breakdown. The sidebar now uses the shared quote function and labels VAT. Browser regression failed before and passed after the fix. A legacy no-VAT listing still shows GBP650/month without a VAT label. No money stored or charged was changed.
- Client fix commit: `02857e0`. Production build passes. Lint has the same pre-existing 18 errors and 2 warnings in PropertyDetails.jsx, with no new findings.
- GitHub pushes recovered. Commits through `02857e0` are on the feature branch. Exact-commit Vercel preview: `https://client-1byxkwn4l-ven-come.vercel.app` (deployment `dpl_r628gvaEYnPzMHT5xJJopCr64NfD`). Do not promote without finishing the release checklist.
- Invoice design approval and registered London address requested. Company number 17182804 comes from the supplied new terms. Account identities and mirror connection configuration remain outstanding.

## Documents retry handling and test-listing rule

- Jayden's rule: never use client-owned live listings for any test flow. Use only Empty Content Creator Room or an agent-created test listing. No fallback to client listings. Saved in root AGENTS.md/CLAUDE.md and the vault. The local lease harness now explicitly selects the designated room only.
- Document rename and move HTTP checks pass against synthetic in-memory records. Browser search returns only the disposable QA sample. Native browser rename prompts could not be controlled reliably, so their mutations were verified through isolated HTTP tests instead of touching live documents.
- Found a deletion error-handling bug in both Documents and automatic backup retention: R2 errors were swallowed before metadata was removed. Now a failed storage deletion returns an error and retains metadata for retry.
- Reproduced failures before fixing. All 102 server tests pass afterward. Changes are committed/pushed as server `8bd00f1`, draft PR https://github.com/Vencomeltd/server/pull/17. Not merged or deployed.
- Invoice preview was sent to Jayden as a one-page sample PDF. Await client design approval and full registered address. No production invoice changes.


## Latest release and lease acceptance continuation
- Invoice PR18 deployed on Render at 144eba4. Registered address and design approval resolved. Full PDF suite passed.
- Documents retry PR17 deployed and verified Live at e852936. Combined 106 server tests passed.
- Photo skipping isolated client PR29 is live at b168d9b. Publishing still requires a photo.
- Lease pricing card incorrectly said Monthly rolling even for minimum-term listings. Reproduced using real PricingSection rendered against wholly synthetic data. Fixed by passing pricing.minimumTermMonths. Rendering checks pass for rolling, 1-month and 12-month minimums. Preview-only, part of remaining feature acceptance.
- Next pricing check: PricingSection currently displays stored tier.price without VAT treatment label. Verify inc/ex/no VAT consistently against the shared quote and repair display only if required. No client listing flows used.
- New building/site parent listing with child room cards recorded in shared vault backlog. Visual preview before implementation. Tracker data and room booking/availability decisions pending.


## VAT pricing-card check
Reproduced pricing options showing £100 net without a VAT label for a £120 gross quote. Browse cards also omitted configured utilities. Both display paths now use the existing shared quote function for one unit, show inc. VAT when applicable and identify included utilities. Booking tier core values remain unchanged.
Synthetic actual-component/helper checks pass: excludes £100 -> £120, includes £120 stored as £100 net -> £120, no VAT £100 -> £100, VAT plus £10 utilities -> £132, no VAT plus utilities -> £110, legacy no-VAT £650 -> £650. Tests assert labels and unchanged tax data. Harness: ../test-results/check-pricing-display.cjs (NODE_PATH points to client node_modules). No client listings used. Preview-only pending release checklist.


## Checkout VAT acceptance passed
Nine synthetic React renders of the actual Checkout component passed: single, recurring series and 12-month lease for excludes/includes/none. All include £10 utilities per month. VAT cases show £100 core + £10 utilities + £22 VAT = £132, two-date series £264, lease due today £132. No-VAT equivalents £110, £220 and £110. Checks compare server quote fields, correct VAT-row visibility and lease Due today label. All effects, payment components and network calls stubbed. Harness ../test-results/check-checkout-vat.cjs. Focused server VAT/lease tests 14/14 pass. No checkout production code change needed, no payment or live data accessed. This verifies rendering and local server tests, not a live Stripe transaction.
