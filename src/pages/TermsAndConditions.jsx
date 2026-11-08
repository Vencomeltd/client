import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";

const SECTIONS = [
  {
    "id": "1",
    "title": "General Platform Terms",
    "content": ""
  },
  {
    "id": "1.1",
    "title": "About VenCome and acceptance",
    "content": "1.1.1 VenCome Ltd is registered in England and Wales under company number 17182804. In this document, the Platform means VenCome Ltd and the Marketplace means its website, applications and booking services. Contact support@vencome.com or visit www.vencome.com.\n\n1.1.2 A Host is the person or organisation offering a space. A Customer is the person or organisation booking it. Each user must be at least 18 or an organisation represented by an authorised adult and must have authority to bind any organisation on whose behalf they act. Consumer or business status depends on the actual transaction, not an account label.\n\n1.1.3 Where the Marketplace presents an electronic acceptance control, selecting “I agree”, ticking the acceptance box or using an equivalent clearly identified control records acceptance of the applicable terms made available before that action. No handwritten signature is required for acceptance of these Platform terms. A person accepting on behalf of an organisation confirms that they have authority to bind it. Users may save a copy of the applicable version. Electronic acceptance of these terms does not replace any separate execution formalities required for a Booking Agreement.\n\n1.1.4 The applicable terms take effect when accepted by the Platform and the user. Publication of this document alone does not retrospectively replace existing agreements or confirmed bookings. Numbered references identify clauses in this document, including the relevant section."
  },
  {
    "id": "1.2",
    "title": "Platform role and separate agreements",
    "content": "1.2.1 The Platform operates the Marketplace and facilitates enquiries, booking administration and payments through Stripe. The Host identified in the booking supplies the space and included services. The Platform does not own or operate the premises, provide the Host’s professional services, or become the landlord or occupier by processing a booking.\n\n1.2.2 The General Platform Terms and applicable Host Listing Terms or Customer Booking Terms govern each user’s relationship with the Platform. A separate Booking Agreement between the Host and Customer governs the space itself. Host documents do not make the Platform the landlord or supplier of the space or impose obligations on it without its agreement.\n\n1.2.3 Host–Customer agreement. The Booking Agreement is between the Customer and Host and incorporates the accepted listing, booking details and identified occupancy documents. Those documents must be capable of being saved and accepted or validly executed before confirmation. The Platform Cancellation Policy in clause 1.5 and the accepted Marketplace payment and deposit rules form part of the Booking Agreement. Minimum terms, notice and break provisions must be compatible with that policy and supported by the booking process.\n\n1.2.4 Priority for the space. Mandatory law prevails. The Platform Cancellation Policy and the accepted Marketplace payment and deposit conditions prevail over conflicting Host documents, messages or listing descriptions. On other space-related matters, expressly accepted booking-specific provisions prevail over compatible general Host Booking Terms and then applicable default Host–Customer conditions. An uploaded or separately signed Host document cannot introduce a different Marketplace cancellation policy.\n\n1.2.5 The legal nature of occupation depends on the actual rights and applicable law. Calling an arrangement a booking, licence or membership does not determine whether a lease or statutory protection arises. Appropriate occupancy documents and formalities must be completed before confirmation. A Marketplace booking record does not replace specialist property documentation where required.\n\n1.2.6 The Host and Platform cannot reduce a Customer’s accepted rights through their separate commercial arrangements. Host terms cannot change the Platform’s rules on commission, collections, payouts, deposits, conduct or complaints. No separate Host cancellation policy is available under this version. Any future additional Platform policy must be implemented and offered through the Marketplace before it applies and cannot retrospectively change a confirmed booking."
  },
  {
    "id": "1.3",
    "title": "Accounts conduct privacy and reviews",
    "content": "1.3.1 Users must provide accurate information, keep accounts secure, allow access only to authorised personnel and promptly report suspected security breaches. Users must not use the Marketplace for fraud, unlawful activity, harassment, discrimination, infringement, misleading reviews or deliberate fee evasion. Viewings and necessary direct operational contact are permitted; introduced bookings must follow the agreed Marketplace payment process. The additional Host introduction obligations appear in clause 2.12.\n\n1.3.2 The Platform and Hosts use booking information for the service, security and legal purposes described in applicable privacy notices. Hosts receive information necessary to handle their bookings, not an unrestricted right to market to the Customer. Data processing requires an appropriate lawful basis; accepting these terms is not blanket consent to all marketing or personal-data uses.\n\n1.3.3 Only genuine experience may be reviewed. The Platform may remove fraudulent, abusive, discriminatory, unlawful or irrelevant content under consistently applied rules, but does not remove a genuine negative review simply because it is unfavourable. The Platform does not promise that a review or identity check guarantees quality.\n\n1.3.4 Sensitive patient or client health records must not be uploaded to arrange a workspace booking. A genuine review or lawful complaint is not grounds for retaliation or arbitrary removal. Additional Host data and confidentiality duties appear in clause 2.13."
  },
  {
    "id": "1.4",
    "title": "Service availability and restrictions",
    "content": "1.4.1 The Platform will exercise reasonable care and skill in providing its services. The Platform may maintain or change the Marketplace and will give reasonable notice of material planned disruption where practicable. Third-party outages, payment or calendar failures can occur, but this does not exclude responsibility for the Platform’s own failure to exercise reasonable care or to fulfil an express obligation.\n\n1.4.2 Events outside reasonable control may excuse only the affected failure while it continues; the affected party must notify the other and mitigate. This does not permit keeping money for a service not provided where a refund is due. The Platform will cooperate on lawful refunds and existing bookings.\n\n1.4.3 The Platform may restrict access proportionately for a material breach, credible safety or fraud risk, or a legal requirement. The Platform will normally give reasons and a chance to respond; urgent action can be taken first where reasonably necessary. Restriction does not automatically cancel a Booking Agreement or forfeit the Customer’s money. Additional safeguards and grounds for Host restrictions appear in clause 2.11."
  },
  {
    "id": "1.5",
    "title": "Platform Cancellation Policy",
    "content": "1.5.1 The Platform Cancellation Policy in this clause applies to Customer cancellations. It takes priority over conflicting Host cancellation or refund terms and must be disclosed before commitment and saved with confirmation. No separate Host cancellation policy is available under this version. Mandatory legal rights and refunds due to Host or Platform breach remain protected.\n\n1.5.2 For a cancellation received before the scheduled start, the following bands apply to the Cancellation Base defined in clause 1.5.3. Receipt is recorded through an available cancellation function or support@vencome.com. The calculation uses the exact time until the scheduled start, with the venue’s local time and relevant UTC offset; it is not based on midnight or rounded down to whole hours. Exactly 48 hours gives 100%, exactly 24 hours gives 50%, and exactly 23 hours gives 0%.",
    "table": [
      [
        "Cancellation received before the scheduled start",
        "Refund of Cancellation Base"
      ],
      [
        "At least 48 hours before the scheduled start",
        "100%"
      ],
      [
        "24 hours or more but less than 48 hours before the scheduled start",
        "75%"
      ],
      [
        "Less than 24 hours before the scheduled start",
        "0%"
      ]
    ],
    "afterTable": "\n\n1.5.3 Cancellation Base. For a single booking, this is the agreed rent and compulsory fixed booking charges, including applicable VAT, excluding the refundable security deposit. For a fixed-term multi-month or annual booking, it is only the first rental instalment and fixed charges included in it, identified by amount and covered period before confirmation. The percentage applies to that amount rather than automatically to the entire fixed-term rent. The booking cannot be confirmed without this disclosure and a supported calculation.\n\n1.5.4 Later instalments. A valid cancellation received before commencement ends the whole booking. Later rental instalments are cancelled; any later-period instalments already collected must be refunded in full. Only the non-refunded portion of the first instalment may be retained as the contractual cancellation charge, subject to mandatory law. The Host cannot demand the remaining minimum-term or annual rent for that cancellation. For an annual amount paid upfront, the first-instalment allocation must still be expressly identified; no one-twelfth allocation is assumed. The security deposit is treated separately under the applicable security deposit provisions in clause 2.9 or 3.6.\n\n1.5.5 The 0% band concerns only the Cancellation Base. It does not permit keeping the deposit or prepaid later instalments on a valid pre-start cancellation. After the scheduled start, the pre-start mechanism does not itself terminate a fixed commitment or cancel later rent; supported post-start termination provisions and mandatory rights apply. A failure to attend does not by itself authorise extra charges or automatic deposit forfeiture.\n\n1.5.6 If the Host cancels before commencement, double-books or cannot provide an available, accessible and materially as-described space, the Customer is entitled to a full refund of the cancelled booking payments and security deposit. The Customer cancellation bands do not apply. A substitute requires the Customer’s agreement. Where use has begun, remedies reflect the failure and applicable rights, including a full refund where properly due. Prompt reports assist investigation but do not remove statutory or latent claims.\n\n1.5.7 The cancellation bands do not authorise an excessive charge or double recovery. Where consumer rules require it, any retained amount must reflect recoverable loss, avoided costs and reasonable mitigation, including resale. A greater refund required by law must be given, even where the system’s standard percentage is lower.\n\n1.5.8 The Platform will normally aim to initiate an established refund within 3–5 business days, subject to any shorter statutory deadline. Bank and provider processing can take longer. Refunds normally use the original payment method; an alternative must be verified and must not duplicate a refund already made.\n\n1.5.9 If the Customer is a consumer and statutory cancellation rights apply to a distance service contract, the Customer generally has 14 days from its formation to cancel without giving a reason. There are exceptions, including some property-right transactions and certain date-specific services. The Platform and the Host must assess the actual booking and explain any exception before the Customer commits; the Platform does not claim that every workspace booking is exempt.\n\n1.5.10 If the Customer expressly requests a covered service to start during its statutory cancellation period, the Customer may owe only the proportion lawfully due for service supplied before cancellation. Loss of a statutory cancellation right on full performance requires the legally required prior consent and acknowledgement. Any refundable sum must be returned within the applicable statutory period. Mandatory rights override any inconsistent Host policy.\n\n1.5.11 The Customer may cancel through an available cancellation function or by a clear notice to support@vencome.com giving the booking reference. The recorded receipt, not the time a support agent reads it, determines the applicable band. Cancelling the Platform’s separate services does not by itself end a Booking Agreement; the express pre-start booking cancellation right above and any applicable ancillary-contract rules remain effective.\n\n1.5.12 The Host must accept this policy before receiving bookings and provide evidence of recoverable loss when reasonably requested. Conflicting minimum-term or notice provisions do not restrict the pre-start cancellation right. A technical setting cannot override a legal refund entitlement. Correct policy refunds are authorised under clause 2.8.7 and do not require fresh Host consent for each refund."
  },
  {
    "id": "1.6",
    "title": "Complaints and deposit review",
    "content": "1.6.1 Users may send complaints, including challenges to booking, removal, payment or deposit decisions, to support@vencome.com with the booking reference where relevant, the issue, requested resolution and evidence. The Platform will acknowledge complaints promptly, seek relevant evidence, give both sides a reasonable opportunity to respond and explain its proposed outcome within a reasonable period. If more time is needed it will provide an update.\n\n1.6.2 Within its accepted authority and lawful control of money, the Platform may make a reasoned administrative allocation applying the accepted contracts and mandatory law. Users may request review, by another person where practicable. Disputed holds must be proportionate, legally permitted and regularly reviewed, with undisputed money released. Support does not finally determine legal liability.\n\n1.6.3 The process does not require a waiver of statutory rights, bank remedies, legal advice or access to court. Provider chargeback rights and decisions operate separately; the same loss must not be recovered twice. Either party may propose independent mediation, with the mediator and costs agreed, without limiting mandatory mediation rights. Urgent legal relief is not delayed by this process."
  },
  {
    "id": "1.7",
    "title": "Changes to these terms",
    "content": "1.7.1 The Platform may update these terms from time to time to reflect changes in law, its services, security requirements or commercial arrangements. The Platform will notify the Host of material changes by email or another durable medium, identifying the changes and the date on which they will take effect. At least 15 days’ notice will be given, and longer where reasonably needed for technical or commercial adaptation. Urgent changes are limited to legal requirements or unforeseen imminent fraud or security risks; notice will be given as soon as reasonably practicable where advance notice is not possible. Existing confirmed bookings and earned commission terms are not retrospectively changed without the affected parties’ agreement or a legal requirement. The Host may stop accepting new bookings and leave before a change takes effect. Any further acceptance required by law will be obtained.\n\n1.7.2 The Platform may update these terms from time to time to reflect changes in law, its services, security requirements or commercial arrangements. The Platform will notify the Customer of material changes by email or another durable medium before they affect future use, explaining the changes and their effective date and normally giving at least 15 days’ notice where practicable. Shorter notice is reserved for legal requirements or urgent fraud or security risks, with notice as soon as reasonably practicable. Existing confirmed bookings are not retrospectively changed without the required agreement or a legal requirement. The Customer may stop using the Marketplace before a change takes effect, subject to outstanding Booking Agreements and lawful payment obligations. Any further acceptance required by law will be obtained."
  },
  {
    "id": "1.8",
    "title": "Law notices and general provisions",
    "content": "1.8.1 English law governs each user’s agreement with the Platform. Business disputes fall within the jurisdiction of the courts of England and Wales, subject to mandatory rights. Consumers retain mandatory protections and any right to bring proceedings in the courts of their place of residence. The governing law of a Booking Agreement must be stated in that contract and cannot remove mandatory rights.\n\n1.8.2 Notices may be sent to the account email or support@vencome.com and must be capable of being saved. If a provision is unenforceable, the remainder continues so far as lawful. Delay in enforcement is not a waiver. No transfer may reduce existing rights or relieve responsibility without lawful agreement. These terms do not require a class-action waiver or compulsory arbitration. No person acquires enforcement rights merely by appearing in promotional content."
  },
  {
    "id": "2",
    "title": "Host Listing Terms",
    "content": "This section applies to Hosts in addition to the General Platform Terms. It covers listing services, Host responsibilities, commission, payment administration and the Platform’s responsibilities to Hosts. The Platform Cancellation Policy in clause 1.5 applies to every eligible booking."
  },
  {
    "id": "2.1",
    "title": "Platform role and Host control",
    "content": "2.1.1 The Platform provides the Marketplace for advertising spaces, introducing Customers and facilitating booking administration and payments through Stripe. The Host supplies the space and is responsible for the agreed access and services. The Platform does not own, operate or take possession of the space and does not guarantee a Customer’s performance.\n\n2.1.2 The Host appoints the Platform as its limited agent to conclude a Booking Agreement on the Host’s behalf only following the Host’s manual acceptance or its standing authority under an enabled automatic acceptance setting, and to arrange payment collection and permitted refunds as described in these terms. The Platform has no authority to change the Host’s commercial terms without agreement and does not act as the Customer’s agent in concluding the Booking Agreement.\n\n2.1.3 The Host controls its prices, availability, permitted uses and supported booking acceptance settings. Host Booking Terms must comply with clause 2.2 and cannot introduce a separate cancellation or refund policy. Listing is free and non-exclusive. The Platform’s remuneration is the commission in clause 2.7, with no separate listing or promotional charge under these terms. The Host may market elsewhere, subject to confirmed bookings and clause 2.12."
  },
  {
    "id": "2.2",
    "title": "Host agreement and commercial arrangements",
    "content": "2.2.1 These Host Listing Terms and the General Platform Terms form the Platform–Host agreement. A Commercial Schedule records host-specific commission, collection, payout and deposit arrangements expressly agreed by both parties. It varies only the identified commercial points and does not authorise a separate Host cancellation policy or change a Customer’s accepted rights.\n\n2.2.2 The Host must make required occupancy documents available to save and obtain acceptance or valid execution before confirmation. It must remove or expressly disapply conflicting provisions before a listing becomes bookable. The Platform may refuse or pause unsupported or conflicting listings. The relationship and priority of the agreements are set out in clause 1.2."
  },
  {
    "id": "2.3",
    "title": "Host account and listing information",
    "content": "2.3.1 The Host must be at least 18 or an organisation represented by an authorised adult. The Host must keep its business, identity, contact, bank and tax information accurate, permit account access only to authorised personnel, and promptly notify the Platform of suspected security breaches or material changes affecting performance.\n\n2.3.2 The Host must have authority to let or license the space and hold all necessary consents and permissions. The Host is responsible for the premises’ safety, lawful use, condition and accurate accessibility information. The Host must maintain public liability insurance appropriate to the premises and permitted activities, together with other insurance required by law or applicable professional regulation. Any specific minimum cover required by the Platform must be identified and agreed before the affected listing becomes bookable. The Host must provide reasonable evidence on request. A Host offering premises only is not required by this clause to insure a Customer’s separate professional practice.\n\n2.3.3 Each listing must accurately identify the space booked, exclusive or shared use, occupancy capacity, size where stated, facilities, access hours, earliest availability, minimum commitment, full pricing and material restrictions. Capacity does not identify the number of separately bookable desks. Photographs must depict the actual space or clearly identify shared facilities or approved representative examples.\n\n2.3.4 The Host must keep availability and booking settings accurate, including bookings made elsewhere. For manual acceptance, the Host must check the request before accepting. For automatic acceptance, the Host must maintain accurate availability, prices, permitted-use criteria and supported booking requirements in advance. Calendar synchronisation does not remove these duties. The Platform may request proportionate evidence of authority, safety, insurance, content rights or listing accuracy and restrict an affected listing while a material issue is checked.\n\n2.3.5 A badge or document review has only the meaning expressly stated alongside it. It is not a certification of the premises or a practitioner. Each Customer remains responsible for qualifications, permissions and professional insurance required for its own activities. The Host must not knowingly permit unlawful activities or an activity requiring insurance that is absent."
  },
  {
    "id": "2.4",
    "title": "Prices and customer information",
    "content": "2.4.1 The Host must state whether VAT is chargeable on each listed supply, the applicable rate where relevant, and the full price including calculable compulsory utilities, service charges, business rates and other mandatory charges. The main customer-facing price must include applicable VAT and calculable compulsory charges unless a lawful business-only presentation is expressly agreed. The Platform will not add VAT solely because a tax field is available: the Host must confirm the correct VAT treatment for the particular supply.\n\n2.4.2 A refundable security deposit must be shown separately from rent. Where a genuine usage-dependent charge cannot be fixed in advance, its calculation, collection method and any minimum amount must be prominently disclosed before confirmation. Optional Host services require the Customer’s agreement. Mentioning a charge in the description does not itself configure its collection.\n\n2.4.3 Discounts, free periods and promotional prices require the Host’s approval and clear conditions. Price changes apply to new bookings and must not alter confirmed bookings unless the existing Booking Agreement lawfully permits the change and required notice or acceptance has occurred. The Host remains responsible for VAT on its supply and any legally required valid tax invoice. A Platform payment receipt is not automatically a valid Host VAT invoice."
  },
  {
    "id": "2.5",
    "title": "Listing edits and promotional content",
    "content": "2.5.1 The Host retains ownership of its supplied content and branding. The Host grants the Platform a non-exclusive, worldwide, royalty-free licence to host, copy, publish, distribute, display, format and make reasonable editorial adaptations to that material to operate the Marketplace, advertise the Host’s spaces and promote the Marketplace’s services.\n\n2.5.2 The licence covers the Platform’s websites, applications, social media, email campaigns, search and social advertising, and promotional presentations. The Platform may authorise hosting, design, marketing and distribution providers to use the material only for those purposes. The Platform will respect reasonable brand guidance and credit requirements supplied before use. The Host must have the rights and permissions needed to grant this licence, including relevant photographer and identifiable-person permissions.\n\n2.5.3 The Platform may improve titles, spelling, descriptions, layout, image crops and search presentation, or remove unsupported claims. The Platform must not change rent, capacity, availability, access, permitted use or contract conditions without the Host’s approval, or alter an image so that it misrepresents the space. The Host can request correction of an inaccurate or inappropriate edit. Assisted listings must be approved by the Host before first publication.\n\n2.5.4 After a listing is withdrawn or the agreement ends, the Platform will stop new promotion of it and remove it from active marketing under the Platform’s control as soon as reasonably practicable, normally within 30 days. The Platform may retain necessary booking, legal and backup records, and cannot recall material already distributed or copied by third parties. On a reasonable request the Platform will remove historical promotional posts under the Platform’s control where continued use is misleading or causes a legitimate concern. No unrelated sale or licensing of the Host’s content is authorised."
  },
  {
    "id": "2.6",
    "title": "Booking acceptance and longer commitments",
    "content": "2.6.1 Manual and automatic acceptance are available where enabled. Manual acceptance is the Host’s individual approval; automatic acceptance gives standing authority to accept eligible bookings without further manual approval. Both require acceptance of the applicable terms, required execution formalities, valid payment conditions and a Marketplace confirmation. An enquiry or request acknowledgement is not confirmation. Neither method permits a conflicting cancellation policy. Where occupancy documents, checks or the cancellation calculation cannot be supported, the listing must not become bookable; manual approval does not cure an unsupported payment or refund process.\n\n2.6.2 A minimum commitment differs from a billing period. Paying monthly does not by itself create a rolling monthly contract. However, the Platform Cancellation Policy expressly permits pre-start cancellation of an eligible fixed-term booking on the first-instalment basis in clause 1.5.4. The Host accepts that rule despite the stated minimum term. After commencement, any termination or break rights must be lawful, disclosed and supported by the Marketplace; a new rental instalment does not itself create a fresh pre-start cancellation right.\n\n2.6.3 The Platform supports only the booking and payment arrangements agreed and actually enabled for the listing. Unless an approved instalment plan is expressly offered, the full booking price is payable upfront on confirmation; an annual-price booking therefore requires the full annual price. Monthly instalments or Direct Debit must not be advertised as available until enabled and the schedule, mandate, payout process and failure handling have been agreed.\n\n2.6.4 The legal nature of occupation depends on the rights granted and the facts, not the Marketplace’s labels. The Platform does not itself grant a tenancy or determine that a lease or statutory renewal right cannot arise. Before a long-term or exclusive-occupation booking is confirmed, the Host must supply an appropriate professionally reviewed Booking Agreement and complete any required formalities. Residential use is not permitted through the Platform."
  },
  {
    "id": "2.7",
    "title": "Commission and fees",
    "content": "2.7.1 Unless the Platform agrees otherwise in writing, commission is 10% for an hourly, daily or weekly pricing option, 6% for a monthly pricing option and 3% for a yearly pricing option. The selected pricing option, not merely the duration of occupation or payment frequency, determines the rate.\n\n2.7.2 Commission applies to the Rental Charge, including VAT chargeable on that rent. The Rental Charge excludes a refundable security deposit and separately itemised utilities, service charges, business rates and other non-rent charges. For a bundled price the Platform must agree the allocation before accepting bookings. Charges must not be artificially re-labelled to avoid commission.\n\n2.7.3 An approved annual-price booking paid in instalments keeps the annual commission rate unless a different rate is expressly agreed. The Platform deducts commission from rental sums actually collected and retained, with a proportionate credit when the corresponding rent is refunded. If a booking is cancelled before commencement under clause 1.5, commission applies only to the rental portion of the cancellation amount lawfully retained, not cancelled future rent or the security deposit.\n\n2.7.4 No commission or payment-processing or refund fee is charged to either party on a refundable deposit; the Platform absorbs those deposit-processing costs. No separate listing, promotional or other additional Platform service fee is payable under these terms. Any VAT legally chargeable on the Platform’s commission must be clearly stated and agreed before the relevant booking; it is distinct from VAT on the Host’s rent.\n\n2.7.5 A founding-host concession already expressly granted remains applicable according to its agreed scope. It is not newly offered by these terms. Any negotiated concession or commission change must identify the account, duration or bookings covered and be agreed in writing."
  },
  {
    "id": "2.8",
    "title": "Collections and Host payouts",
    "content": "2.8.1 Payments are processed through Stripe under the applicable payment-provider terms. The Host must complete required onboarding and keep payout details current. Payment received through the approved collection process on the Host’s behalf satisfies the Customer’s corresponding payment obligation; a later delay in the Host’s payout is not a basis to demand that the Customer pay the same amount again.\n\n2.8.2 For an enabled monthly collection arrangement, the Platform’s agreed target is to initiate the Host’s payout 48–72 hours after each successful monthly payment is collected and available for payout, less agreed deductions. This is a payout-initiation target, not guaranteed bank arrival. Bank processing, non-business days, first-payment checks and payment-provider restrictions may affect timing; the Platform will explain a material delay when permitted.\n\n2.8.3 Annual-prepaid and other collection or payout schedules must be expressly recorded in the Commercial Schedule before the relevant listing becomes bookable. Neither an annual term nor a yearly price implies monthly collection or monthly release of a prepaid annual balance. The Platform will not accept an extended booking whose payment or custody arrangements are unsupported.\n\n2.8.4 Payout statements will identify rent and other sums collected, commission and any VAT on the Platform’s fees, refunds and permitted deductions. The Platform may deduct only agreed fees, sums legally repayable to Customers and documented amounts the Host owes under these terms. Any recovery outside an agreed payment mandate requires the Host’s agreement or an appropriate legal route.\n\n2.8.5 The Platform may delay only the proportion of funds reasonably affected by a genuine refund, chargeback, fraud, safety or legal issue, or a provider requirement. The Platform will give reasons and an opportunity to respond unless prohibited, review the restriction promptly and release unaffected sums when possible. The Platform does not promise an escrow account, interest or insolvency protection unless a separately verified arrangement expressly provides it.\n\n2.8.6 Failed Customer payment. If a payment fails, the Platform will notify the Host and request payment from the Customer through the approved process. The Platform does not guarantee or advance unpaid rent. Any action concerning arrears, cancellation or access must follow the Booking Agreement and applicable law. A delay by the Platform in paying out money already successfully collected must not be treated as the Customer’s failure to pay.\n\n2.8.7 Refund after Host payout. The Host authorises the Platform to administer refunds under the Platform Cancellation Policy and mandatory law, without needing a new Host approval for each correctly calculated refund. If money already paid out to the Host must be returned, the Host must repay the corresponding amount received. The Platform will credit commission attributable to refunded rent and provide a calculation. Recovery from future payouts requires valid agreed authority and applicable law; otherwise an appropriate legal route is required. A discretionary Platform goodwill refund does not automatically create a Host debt. Provider reversals may occur under provider rules; the Platform will notify the Host promptly and avoid duplicate recovery."
  },
  {
    "id": "2.9",
    "title": "Security deposits and evidence",
    "content": "2.9.1 The Host sets a proportionate fixed deposit, disclosed before confirmation with its permitted uses and return process. The Host must check that the Marketplace’s deposit collection option is enabled, including the alternative charge required where a card authorisation cannot last for the booking. Mentioning a deposit in a description does not collect it. A missing or failed collection must be resolved before the Host relies on deposit protection.\n\n2.9.2 A deposit may be a temporary card authorisation for a supported short booking or a separate refundable charge for a longer supported booking. The actual method and timing must be disclosed before payment. The Platform does not represent that a card hold lasts for the whole term of an extended booking. If an authorisation fails, the Customer will be asked to provide a valid method; cancellation or refusal of access must follow the disclosed contract and applicable law.\n\n2.9.3 A charged deposit is administered under the disclosed arrangement and is not paid to the Host as ordinary rent. For extended bookings, the lawful holder or custody provider, permitted holding duration, protection and release procedure must be confirmed and accepted before collection. An arrangement that exceeds a provider’s permitted duration will not be enabled. The Host cannot replace that arrangement through its Host Booking Terms without the Platform’s express agreement.\n\n2.9.4 The Host must keep proportionate check-in and check-out evidence, notify an initial damage claim within 24 hours after the booking ends with the issue and estimated amount, and provide photographs, inventories and reasonable repair evidence promptly. If a genuine obstacle prevents inspection, the Host should request an extension within that period where possible. The Platform will consider reasonable extensions and mandatory rights without promising custody beyond permitted limits.\n\n2.9.5 Only evidenced loss within the accepted deposit scope may be deducted, allowing for fair wear and tear, depreciation and reasonable cost. A deposit cannot fund Platform commission, cancellation charges or the Platform’s own liabilities. It is not automatically forfeited on cancellation. A pre-start cancellation under clause 1.5 requires its full return unless an independent lawful deduction is established. A deposit is security, not a guarantee by the Platform and not an automatic cap on the Customer’s separate legal liability.\n\n2.9.6 The Platform will give the Customer the claim and evidence and a reasonable chance to respond, ordinarily seven days. The Platform will retain only a reasonably disputed amount where permitted, release the undisputed balance, and explain any administrative decision under clause 1.6. If no timely claim or justified restriction applies, the Platform will initiate a full refund or release promptly after the claim window. Host and Customer retain their legal rights; deposit release does not itself extinguish a separate lawful claim.\n\n2.9.7 Refunds normally return through the original payment method. An expired or replaced card does not automatically require a bank transfer. If the provider confirms the refund cannot complete, the Platform will arrange a verified lawful alternative and prevent duplicate refunds. Bank or provider processing times may vary. A Customer receives the refundable balance without a deduction for deposit-processing fees."
  },
  {
    "id": "2.10",
    "title": "Cancellations and disputes",
    "content": "2.10.1 The Host must comply with the Platform Cancellation Policy in clause 1.5, including its first-instalment calculation, cancellation of later instalments and separate treatment of deposits. The Host must not demand rent excluded by that policy or rely on conflicting Host documents. Complaints and disputed allocations are handled under clause 1.6."
  },
  {
    "id": "2.11",
    "title": "Restrictions and removal",
    "content": "2.11.1 The Platform may pause or remove a listing where there is a reasonable, evidenced concern about safety, authority to offer the space, material inaccuracy, illegality, infringement of rights, non-payment of agreed fees, failure to provide required information or repeated material failures to honour bookings or refunds. Action will be proportionate to the affected space and risk.\n\n2.11.2 The Platform may immediately suspend a listing or account where reasonably necessary to address credible fraud, serious safety risks, violence, harassment, unlawful discrimination, serious privacy or security breaches, unlawful activity or other conduct connected with the service that presents a demonstrable risk of serious harm to users or the marketplace. The Platform may also comply with a binding legal or payment-provider requirement.\n\n2.11.3 For a remediable breach without an urgent risk, the Platform will normally explain the issue and allow at least 14 days to correct it. Whole-account termination normally requires at least 30 days’ written notice and reasons. Shorter or immediate termination is reserved for a legal requirement, an imperative reason recognised by law or demonstrated repeated material breaches, consistently with any mandatory platform-to-business rules.\n\n2.11.4 The Platform will normally explain the relevant facts and contractual grounds before or when a restriction starts, or promptly afterwards where advance warning would increase the risk. The Platform may withhold detail only where law or a legitimate investigation requires it. The Host may challenge a decision through support; the Platform will reconsider supplied evidence and restore access promptly if the grounds fall away.\n\n2.11.5 An unfavourable but genuine review, a lawful complaint about the Platform or an unsubstantiated allegation alone is not a basis for arbitrary removal. Account removal does not automatically cancel Booking Agreements, forfeit money or give the Platform a right to evict anyone. Existing bookings, refunds and permitted payouts must be handled under the accepted contracts and law."
  },
  {
    "id": "2.12",
    "title": "Ending the Host agreement and introduced Customers",
    "content": "2.12.1 The Host may stop accepting new requests and withdraw unbooked availability at any time, and end this agreement by written notice. Confirmed bookings and accrued duties continue unless lawfully ended or transferred by agreement. The Platform will provide reasonable access to relevant transaction records, or a copy, for settlement and mandatory record-keeping.\n\n2.12.2 For 12 months after an introduction through the Platform, the Host must not deliberately move the introduced booking or a direct continuation for the same space outside the Marketplace to avoid an agreed commission. This does not restrict a pre-existing relationship the Host can evidence, unrelated spaces or business, or an arrangement the Platform approves in writing. Viewings and necessary operational contact are permitted, but material terms must be recorded and payments must follow the agreed Marketplace arrangement.\n\n2.12.3 For proven circumvention, only the commission that would have been earned on the relevant rent actually collected is recoverable, with credit for commission already paid. There is no automatic fine or indefinite commission on all future business. The Platform will provide a calculation and an opportunity to respond."
  },
  {
    "id": "2.13",
    "title": "Data confidentiality and reviews",
    "content": "2.13.1 Each party must use personal data lawfully, securely and only as necessary for enquiries, bookings, access, payments, safety, disputes and legal obligations. The Platform and Host ordinarily act as independent controllers, each for its own purposes; actual responsibilities depend on the processing. Processing on the other party’s instructions requires appropriate data-processing terms. Each party must provide required privacy information and lawful transfer safeguards and cooperate promptly on relevant rights requests and security incidents.\n\n2.13.2 The Host must not use Customer contact details for unrelated marketing without a lawful basis and any required consent, or upload patient or client health records to arrange a booking. Each party must keep non-public commercial and customer information confidential, share it only with those who need it for the service, lawful advice or a legal requirement, and retain it only as reasonably needed or legally required. Public listing material is governed by clause 2.5.\n\n2.13.3 Hosts can receive information needed to manage their own enquiries, bookings, payments and disputes, subject to privacy restrictions and the features actually available. They do not receive other Hosts’ confidential customer data. The Platform may use aggregated or effectively anonymised usage information for service improvement, without representing that personal data is owned by the Platform."
  },
  {
    "id": "2.14",
    "title": "Visibility and service availability",
    "content": "2.14.1 Search visibility may take account of location, category, capacity, stated availability, price, listing completeness and relevance, where those features are used. The Platform does not guarantee ranking, impressions, enquiries, bookings, occupancy or revenue. The content licence in clause 2.5 permits promotion but does not require the Platform to purchase advertising or achieve a particular result."
  },
  {
    "id": "2.15",
    "title": "Liability and third party claims",
    "content": "2.15.1 Neither party excludes liability for death or personal injury caused by its negligence, fraud, fraudulent misrepresentation or any liability that cannot lawfully be limited. These terms do not limit the obligation to pay or return money properly due, including Host proceeds, Customer refunds and refundable deposits, or statutory rights in personal data.\n\n2.15.2 Subject to clause 2.15.1, neither party is liable to the other for indirect or consequential loss, or for speculative lost bookings, profit or business opportunities. The Platform is not responsible for the Host’s premises, professional services or a Customer’s independent acts merely because a listing or booking uses the Marketplace. Responsibility for the Platform’s own breach remains subject to these terms.\n\n2.15.3 Subject to clause 2.15.1, each party’s total aggregate liability to the other under this Host agreement in any 12-month period is limited to the greater of £1,000 and commission paid or payable to the Platform by that Host in the preceding 12 months. A separate written Commercial Schedule can agree a different cap. This cap does not alter the separate rights and liabilities of Host and Customer under their Booking Agreement.\n\n2.15.4 The Host must reasonably cooperate with a third-party claim arising from the Host’s lack of authority, unsafe premises, materially inaccurate content, infringement of rights or other breach of these terms. The Host must reimburse the Platform’s reasonable, documented loss to the extent caused by that breach, subject to clauses 2.15.1–2.15.3. No reimbursement is due to the extent the loss is caused by the Platform’s own negligence or breach.\n\n2.15.5 The Platform must notify the Host promptly of a relevant claim, allow reasonable involvement in its defence, mitigate loss and obtain the Host’s consent before a settlement imposing liability on the Host, such consent not to be unreasonably withheld. There is no automatic indemnity for every customer dispute, regulatory fine or loss of reputation.\n\n2.15.6 The Platform does not insure or guarantee rent, property damage, theft or the independent performance of a Host or Customer. Damage claims remain between the legally responsible parties, with eligible deposits applied only under clause 2.9. No deposit, an insufficient deposit or unsuccessful recovery does not by itself create a Platform obligation to compensate. This does not exclude the Platform’s own liability preserved by clause 2.15.1 or alter its express service and payment duties."
  },
  {
    "id": "2.16",
    "title": "Entire Host agreement",
    "content": "2.16.1 These General Platform Terms, Host Listing Terms and any expressly agreed Commercial Schedule are the whole agreement about the Platform–Host Marketplace relationship, without excluding fraud or liability that cannot lawfully be excluded. Changes, complaints and general provisions appear in clauses 1.6 to 1.8."
  },
  {
    "id": "2.17",
    "title": "Commercial summary",
    "content": "",
    "table": [
      [
        "Topic",
        "Default position"
      ],
      [
        "Listing and promotion",
        "Free, non-exclusive listing; no separate listing or promotional fee under these terms."
      ],
      [
        "Hourly daily weekly pricing option",
        "10% of VAT-inclusive Rental Charge."
      ],
      [
        "Monthly pricing option",
        "6% of VAT-inclusive Rental Charge."
      ],
      [
        "Yearly pricing option",
        "3% of VAT-inclusive Rental Charge; approved instalments do not themselves change this rate."
      ],
      [
        "Excluded from commission",
        "Refundable deposits and separately itemised non-rent charges."
      ],
      [
        "Enabled monthly collections",
        "Target payout initiation 48–72 hours after successful collection and funds becoming available; bank arrival can take longer."
      ],
      [
        "Other payout schedules",
        "Agree in writing before enabling the relevant booking; no implied annual holding or monthly release."
      ],
      [
        "Long-term deposits",
        "Custody provider, permitted duration and release process must be agreed and supported before collection."
      ],
      [
        "Host-specific conditions",
        "Compatible space conditions only. The Platform Cancellation Policy overrides conflicting Host cancellation terms; no individual Host policy is available."
      ]
    ]
  },
  {
    "id": "3",
    "title": "Customer Booking Terms",
    "content": "This section applies to Customers in addition to the General Platform Terms. It covers booking requests, prices, payments, deposits, use of spaces and the Platform’s responsibilities to Customers. The Platform Cancellation Policy in clause 1.5 applies; it is set out once for both Customers and Hosts."
  },
  {
    "id": "3.1",
    "title": "Platform Host and Customer roles",
    "content": "3.1.1 The Platform will provide its Marketplace services with reasonable care and skill. A listing, badge, review or document check is not a guarantee of the Host’s financial position, professional qualifications or the suitability of a space for every activity. The Customer should check that the space meets the Customer’s intended use and discuss material requirements before committing."
  },
  {
    "id": "3.2",
    "title": "Agreements and priority",
    "content": "3.2.1 The General Platform Terms and these Customer Booking Terms form the Platform Agreement for the Platform’s own services, including booking and payment administration, deposit administration, complaints and its responsibilities to the Customer. The separate Booking Agreement and priority rules are explained in clause 1.2. Neither manual nor automatic acceptance permits an undisclosed or conflicting cancellation policy."
  },
  {
    "id": "3.3",
    "title": "Requests confirmation and changes",
    "content": "3.3.1 A booking may be accepted manually by the Host or automatically under acceptance settings the Host has enabled. Both require accepted applicable terms, completed execution formalities, satisfied payment conditions and a Marketplace confirmation. An enquiry, temporary payment authorisation or receipt acknowledgement is not confirmation. An unsupported cancellation calculation or required occupancy document cannot be bypassed by automatic or manual acceptance.\n\n3.3.2 Before submitting, the Customer must check the space, dates, capacity, permitted use, total commitment, payment schedule, deposit and Cancellation Base. A fixed-term booking must identify the first-instalment amount used for pre-start cancellation and the effect on later instalments. The confirmation must identify exclusive or shared use; a people-capacity figure is not a count of separately available desks.\n\n3.3.3 Changes to the space, dates, rent or material conditions require the relevant parties’ agreement and a record of any price or refund adjustment before they take effect. The Customer does not have to accept a materially different substitute. A Host must not advertise or confirm availability it cannot provide."
  },
  {
    "id": "3.4",
    "title": "Price payment and refunds",
    "content": "3.4.1 The price presented before confirmation must show the amount payable including applicable VAT and calculable compulsory charges. Any lawful business-only VAT-exclusive presentation must be clear and show the relevant tax information. A refundable deposit is shown separately. The Host must confirm whether VAT is chargeable on the particular supply; no VAT is added solely because the system has a tax field. Genuine usage-based charges must explain how they are calculated and collected, and optional Host services require the Customer’s agreement.\n\n3.4.2 Payments are processed through Stripe. Unless an enabled instalment option is expressly offered, the full booking price is charged upfront on confirmation. A 12-month booking made using an annual price therefore requires payment of the full annual amount at confirmation, plus any disclosed separate refundable deposit. A monthly quoted price does not promise monthly collection.\n\n3.4.3 Monthly instalments or Direct Debit are available only where expressly enabled and offered for the Customer’s booking. Before the Customer accepts such a plan the Customer must receive its payment dates, amounts, first payment, deposit, total contractual commitment, any mandate terms, failure process and permitted changes. The applicable payment arrangement must be recorded in the booking; a future feature is not available unless expressly enabled.\n\n3.4.4 Payment through the approved Marketplace collection process satisfies the corresponding debt to the Host; the Customer should not be asked to pay it again because of a Host payout delay. The Host remains responsible for VAT on its own supply and any legally required VAT invoice. A booking receipt from the Platform is not automatically a valid Host VAT invoice.\n\n3.4.5 The Platform’s commission is deducted from the Host’s rent and is not an undisclosed Customer surcharge. The commission arrangements are set out in clause 2.7. These terms do not impose a separate listing, promotional or other additional Platform service fee.\n\n3.4.6 Money is handled through the disclosed payment-provider arrangement. The Platform does not promise that the Customer’s money is held in an escrow or protected deposit account. Long-term arrangements are accepted only when collection, payout and any deposit custody can lawfully be supported. Host payout arrangements do not alter the Customer’s payment obligations under clause 3.4.4.\n\n3.4.7 If payment fails, the Platform will ask the Customer to correct it through the approved process. Cancellation, arrears and access consequences must follow the accepted contract and law. The Platform does not have an unrestricted right to charge any amount a Host alleges. Refunds that are due will be initiated promptly through the provider; banking times can vary and statutory deadlines take priority."
  },
  {
    "id": "3.5",
    "title": "Long term and recurring arrangements",
    "content": "3.5.1 A minimum commitment differs from a billing period. Paying monthly does not by itself allow monthly cancellation after commencement. Before the scheduled start, the Platform Cancellation Policy in clause 1.5 permits cancellation on the first-instalment basis and cancels later rent. After commencement, any notice, break or termination provisions must be lawful, disclosed and supported by the Marketplace; no additional Host policy may contradict the accepted Platform policy.\n\n3.5.2 Payments or sessions within one fixed-term Booking Agreement remain subject to that commitment after commencement unless lawfully ended. A new instalment is not a new initial booking start. Any supported flexible recurring arrangement must clearly identify whether each session is a separate booking or part of one commitment. There is no universal 48-hour right to cancel all future sessions after a fixed commitment has started.\n\n3.5.3 The Host must supply any appropriate lease, licence or hire agreement and complete required formalities before confirmation. The Platform does not select or approve a property contract as the Customer’s legal adviser. Residential occupation, staying beyond agreed access times or allowing unauthorised occupiers is not permitted by a booking through the Marketplace."
  },
  {
    "id": "3.6",
    "title": "Security deposits",
    "content": "3.6.1 A Host may require a reasonable fixed deposit disclosed before booking with the collection method, timing, permitted deductions and return procedure. It may be a temporary card authorisation for a supported short booking or a separate refundable charge for a supported longer booking. The actual arrangement must be shown before the Customer commits.\n\n3.6.2 A card authorisation reserves funds and may reduce the Customer’s available balance; it is not necessarily a completed payment and has a provider-set expiry. The Platform will not represent that it remains valid for a long contract. If an authorisation fails the Platform may ask the Customer to provide another payment method, ordinarily allowing 24 hours where the start date permits; any cancellation must follow the disclosed terms and applicable law.\n\n3.6.3 For an extended booking, the identity of the deposit holder or custody provider, permitted duration, handling and release process must be disclosed and accepted before collection. A deposit must not be taken under an unsupported holding arrangement. Merely mentioning a deposit in the listing does not establish that it has been collected.\n\n3.6.4 A deposit is not rent or a Platform fee. No commission is taken from it, and the Platform absorbs deposit-processing and return costs. It is not automatically forfeited on cancellation or a damage allegation. A valid pre-start cancellation under clause 1.5 requires its full return unless an independent lawful deduction is established. It cannot be used to pay Platform liabilities or the cancellation charge.\n\n3.6.5 A Host should submit an initial damage claim within 24 hours after the booking ends, with evidence supplied promptly. The Platform may allow a reasonable extension where inspection was genuinely prevented, subject to the permitted custody period and mandatory rights. The Customer may provide its own photographs, inventory and explanation; the Platform will ordinarily give the Customer seven days to respond to a claim.\n\n3.6.6 Only evidenced loss within the accepted deposit scope can be deducted, allowing for fair wear and tear, depreciation and reasonable repair cost. Other debts are covered only where expressly disclosed, accepted and lawful. The Platform will release the undisputed balance and explain any disputed allocation under clause 1.6. A deposit decision does not remove either party’s right to challenge liability in court.\n\n3.6.7 Where no timely claim or justified restriction applies, the Platform will initiate a full refund or release promptly after the claim window. Refunds normally go to the original payment method. A replaced or expired card can often still receive a refund through its issuer. If the provider confirms a refund cannot complete, the Platform will arrange a verified lawful alternative and avoid duplicate payment. Provider and bank processing times may vary."
  },
  {
    "id": "3.7",
    "title": "Cancellations and remedies",
    "content": "3.7.1 The Customer’s cancellation rights, refund bands, statutory rights and remedies for Host cancellation or non-provision are set out in the Platform Cancellation Policy in clause 1.5. That policy applies in addition to mandatory legal rights and takes priority over conflicting Host documents."
  },
  {
    "id": "3.8",
    "title": "Using the space",
    "content": "3.8.1 The Customer must use the space only for the accepted purpose, comply with lawful disclosed safety and access rules, and remain responsible for accompanying people and loss caused by its breach or negligence, allowing for ordinary wear and tear. The Customer must not exceed occupancy, interfere with other users or undertake unlawful or unapproved regulated activity.\n\n3.8.2 The Customer must hold the qualifications, registrations and insurance required for its own professional activities. A Host’s premises or Marketplace badge does not authorise every treatment or service. Sensitive patient or client records must not be supplied to arrange a workspace booking.\n\n3.8.3 The Customer must vacate and return access items as required by the Booking Agreement and applicable law. Any overstay claim must follow the accepted lawful contract, reflect recoverable loss and be evidenced. Additional card collections require valid disclosed authority or an appropriate legal route."
  },
  {
    "id": "3.9",
    "title": "Complaints and deposit review",
    "content": "3.9.1 The complaints and review procedure in clause 1.6 applies to the Customer, including any disputed deposit allocation. It does not limit statutory rights or access to court."
  },
  {
    "id": "3.10",
    "title": "Responsibility and limits",
    "content": "3.10.1 Nothing limits liability for death or personal injury caused by negligence, fraud, fraudulent misrepresentation or anything else that cannot lawfully be limited. These terms do not remove consumer rights, data-protection rights or an obligation to return money properly due.\n\n3.10.2 The Host is responsible for the space and its agreed services; the Platform is responsible for its own Marketplace service and express commitments. The Platform is not responsible for a Host’s or another user’s independent act merely because the booking used the Platform. This does not excuse the Platform’s own negligence or breach.\n\n3.10.3 If the Customer is a consumer, the Platform is responsible for reasonably foreseeable loss caused by the Platform’s breach or failure to use reasonable care and skill. The Platform does not apply a business liability cap to the Customer’s statutory consumer remedies. The Platform is not responsible for business losses where the Customer books as a consumer.\n\n3.10.4 If the Customer books for business purposes, and subject to clause 3.10.1, the Platform’s aggregate liability for the affected booking is limited to the greater of £1,000 and the Platform’s commission paid or payable to the Platform for that booking. The Platform excludes indirect or consequential business loss and speculative lost profit, bookings or opportunity. This does not limit the amount of a refund, deposit or other money already properly due to the Customer, or replace the Host’s separate liabilities.\n\n3.10.5 The Platform does not provide property, professional or business-interruption insurance or guarantee a Host’s solvency or continued performance. The Customer should obtain insurance appropriate to its own activity. Outages and events outside reasonable control may affect service, but do not allow money to be kept where a refund is lawfully due.\n\n3.10.6 Property damage, theft and other independent Host–Customer claims remain the responsibility of the legally liable party. An eligible deposit can be applied only under clause 3.6. The absence or insufficiency of a deposit does not itself oblige the Platform to compensate either party or limit the responsible party’s separate legal liability. The Platform’s own duties and liabilities preserved by clause 3.10.1 remain unaffected."
  }
];

export default function TermsAndConditions() {
  const [active, setActive] = useState(null);

  useEffect(() => {
    const scrollToCancellationPolicy = () => {
      if (window.location.hash === "#cancellation-policy") {
        setActive("1.5");
        setTimeout(() => {
          const el = document.getElementById("cancellation-policy");
          if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
      }
    };

    scrollToCancellationPolicy();
    window.addEventListener("hashchange", scrollToCancellationPolicy);
    return () => window.removeEventListener("hashchange", scrollToCancellationPolicy);
  }, []);

  return (
    <div style={{ background: "#FFFFFF", minHeight: "100vh" }}>
      <Navbar />

      {/* Hero */}
      <div style={{
        background: "#0A1628", color: "#fff",
        padding: "80px 24px 60px", textAlign: "center",
      }}>
        <p style={{ fontSize: "12px", fontWeight: "700", letterSpacing: "3px", color: "#2E58EC", textTransform: "uppercase", marginBottom: "16px" }}>
          Legal
        </p>
        <h1 style={{ fontSize: "clamp(32px, 5vw, 56px)", fontWeight: "800", margin: "0 0 16px" }}>
          Terms & Conditions
        </h1>
        <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.6)", maxWidth: "520px", margin: "0 auto" }}>
          Effective Date: 9 June 2026 — Please read these terms carefully before using VenCome.
        </p>
      </div>

      <div style={{ maxWidth: "860px", margin: "0 auto", padding: "60px 24px" }}>

        {/* Intro */}
        <div style={{
          background: "#fff", borderRadius: "16px", padding: "28px 32px",
          border: "1px solid #E5E7EB", marginBottom: "32px",
        }}>
          <p style={{ fontSize: "15px", color: "#374151", lineHeight: "1.8", margin: 0 }}>
            These terms govern use of VenCome and its booking services. Section 1 applies to all users. Section 2 applies additionally to Hosts listing spaces. Section 3 applies additionally to Customers booking spaces. Users acting in both roles must follow the terms relevant to each activity.
          </p>
        </div>

        {/* Sections */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {SECTIONS.map((section) => {
            const isOpen = active === section.id;
            return (
              <div
                key={section.id}
                id={section.id === "1.5" ? "cancellation-policy" : undefined}
                style={{
                background: "#fff", borderRadius: "14px",
                border: `1px solid ${isOpen ? "#2E58EC" : "#E5E7EB"}`,
                overflow: "hidden", transition: "border-color 0.2s ease",
              }}>
                <button
                  type="button"
                  onClick={() => setActive(isOpen ? null : section.id)}
                  style={{
                    width: "100%", display: "flex", alignItems: "center",
                    justifyContent: "space-between", gap: "16px",
                    padding: "20px 24px", background: "none", border: "none",
                    cursor: "pointer", textAlign: "left",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    <span style={{
                      width: "32px", height: "32px", borderRadius: "8px", flexShrink: 0,
                      background: isOpen ? "#2E58EC" : "rgba(46,88,236,0.08)",
                      color: isOpen ? "#fff" : "#2E58EC",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "12px", fontWeight: "700",
                    }}>
                      {section.id}
                    </span>
                    <span style={{ fontSize: "15px", fontWeight: "700", color: "#0A1628" }}>
                      {section.title}
                    </span>
                  </div>
                  <span style={{
                    fontSize: "18px", color: "#6B7280", flexShrink: 0,
                    transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.2s ease",
                  }}>
                    ▾
                  </span>
                </button>
                {isOpen && (
                  <div style={{ padding: "0 24px 24px" }}>
                    <div style={{ borderTop: "1px solid #F3F4F6", paddingTop: "20px" }}>
                      {section.content.split("\n\n").map((para, i) => (
                        <p key={i} style={{
                          fontSize: "14px", color: "#374151",
                          lineHeight: "1.8", margin: "0 0 12px",
                        }}>
                          {para}
                        </p>
                      ))}
                      {section.table && (
                        <div style={{ overflowX: "auto", margin: "16px 0" }}>
                          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px", color: "#374151", lineHeight: "1.8" }}>
                            <thead>
                              <tr>{section.table[0].map((cell, i) => (
                                <th key={i} scope="col" style={{ padding: "12px", border: "1px solid #E5E7EB", textAlign: "left", background: "#F3F4F6" }}>{cell}</th>
                              ))}</tr>
                            </thead>
                            <tbody>
                              {section.table.slice(1).map((row, i) => (
                                <tr key={i}>{row.map((cell, j) => (
                                  <td key={j} style={{ padding: "12px", border: "1px solid #E5E7EB", verticalAlign: "top" }}>{cell}</td>
                                ))}</tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                      {section.afterTable?.split("\n\n").map((para, i) => (
                        <p key={i} style={{ fontSize: "14px", color: "#374151", lineHeight: "1.8", margin: "0 0 12px" }}>{para}</p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer note */}
        <div style={{
          marginTop: "40px", padding: "24px", borderRadius: "14px",
          background: "rgba(46,88,236,0.05)", border: "1px solid rgba(46,88,236,0.15)",
          textAlign: "center",
        }}>
          <p style={{ fontSize: "14px", color: "#6B7280", margin: 0 }}>
            Questions about these terms? Contact us at{" "}
            <a href="mailto:support@vencome.com" style={{ color: "#2E58EC", fontWeight: "600" }}>
              support@vencome.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
