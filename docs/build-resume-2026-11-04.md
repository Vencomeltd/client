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

Complete Cloudflare sign-in in the open Chrome tab, then create the private `vencome-documents` bucket and configure Render before the Documents walkthrough.
