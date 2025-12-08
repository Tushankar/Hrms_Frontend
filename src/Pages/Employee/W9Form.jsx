import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Target, CheckCircle, FileText } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { Layout } from "../../Components/Common/layout/Layout";
import Navbar from "../../Components/Common/Navbar/Navbar";
import HRFeedback from "../../Components/Common/HRFeedback/HRFeedback";
import axios from "axios";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

// --- Page 2 Component ---
function Page2() {
  return (
    // Added mx-auto to center the page container
    <div className="bg-white p-6 sm:p-10 rounded-lg shadow-lg max-w-6xl w-full font-serif mx-auto">
      {/* Header Section */}
      <div className="flex justify-between items-start pb-2">
        <div>
          {/* Adjusted heading size to match image */}
          <h1 className="text-base font-bold">
            Form W-9 <span className="font-normal">(Rev. 3-2024)</span>
          </h1>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold">Page 2</p>
        </div>
      </div>
      {/* Added border like Page 3 */}
      <hr className="border-t-2 border-black mb-4" />
      {/* Main Content Area - 2 Column Grid */}
      <div className="text-sm text-gray-900 leading-relaxed grid grid-cols-1 md:grid-cols-2 md:gap-x-8">
        {/* Column 1 */}
        <div>
          <p className="mb-4">
            must obtain your correct taxpayer identification number (TIN), which
            may be your social security number (SSN), individual taxpayer
            identification number (ITIN), adoption taxpayer identification
            number (ATIN), or employer identification number (EIN), to report on
            an information return the amount paid to you, or other amount
            reportable on an information return. Examples of information returns
            include, but are not limited to, the following.
          </p>
          {/* Bulleted List */}
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>
              <span className="font-bold">Form 1099-INT</span> (interest earned
              or paid).
            </li>
            <li>
              <span className="font-bold">Form 1099-DIV</span> (dividends,
              including those from stocks or mutual funds).
            </li>
            <li>
              <span className="font-bold">Form 1099-MISC</span> (various types
              of income, prizes, awards, or gross proceeds).
            </li>
            <li>
              <span className="font-bold">Form 1099-NEC</span> (nonemployee
              compensation).
            </li>
            <li>
              <span className="font-bold">Form 1099-B</span> (stock or mutual
              fund sales and certain other transactions by brokers).
            </li>
            <li>
              <span className="font-bold">Form 1099-S</span> (proceeds from real
              estate transactions).
            </li>
            <li>
              <span className="font-bold">Form 1099-K</span> (merchant card and
              third-party network transactions).
            </li>
            <li>
              <span className="font-bold">Form 1098</span> (home mortgage
              interest), <span className="font-bold">1098-E</span> (student loan
              interest), and <span className="font-bold">1098-T</span>{" "}
              (tuition).
            </li>
            <li>
              <span className="font-bold">Form 1099-C</span> (canceled debt).
            </li>
            <li>
              <span className="font-bold">Form 1099-A</span> (acquisition or
              abandonment of secured property).
            </li>
          </ul>
          <p className="mb-4">
            Use Form W-9 only if you are a U.S. person (including a resident
            alien), to provide your correct TIN.
          </p>
          {/* Caution Box - Border removed as requested */}
          <div className="p-3 mb-4">
            <p>
              <span className="font-bold">Caution:</span> If you don't return
              Form W-9 to the requester with a TIN, you might be subject to
              backup withholding. See{" "}
              <span className="italic">What is backup withholding</span>, later.
            </p>
          </div>
          <p className="mb-4">
            <span className="font-bold">
              By signing the filled-out form, you:
            </span>
          </p>
          {/* Numbered List */}
          <ol className="list-decimal pl-8 mb-4 space-y-1">
            <li>
              Certify that the TIN you are giving is correct (or you are waiting
              for a number to be issued);
            </li>
            <li>Certify that you are not subject to backup withholding; or</li>
            <li>
              Claim exemption from backup withholding if you are a U.S. exempt
              payee; and
            </li>
            <li>
              Certify to your non-foreign status for purposes of withholding
              under chapter 3 or 4 of the Code (if applicable); and
            </li>
            <li>
              Certify that FATCA code(s) entered on this form (if any)
              indicating that you are exempt from the FATCA reporting is
              correct. See{" "}
              <span className="italic">What Is FATCA Reporting</span>, later,
              for further information.
            </li>
          </ol>
          <p className="mb-4">
            <span className="font-bold">Note:</span> If you are a U.S. person
            and a requester gives you a form other than Form W-9 to request your
            TIN, you must use the requester's form if it is substantially
            similar to this Form W-9.
          </p>
          {/* Definition Section */}
          {/* Adjusted heading size */}
          <h2 className="text-sm font-bold mb-2">
            Definition of a U.S. person.
          </h2>
          <p className="mb-4">
            For federal tax purposes, you are considered a U.S. person if you
            are:
          </p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>An individual who is a U.S. citizen or U.S. resident alien;</li>
            <li>
              A partnership, corporation, company, or association created or
              organized in the United States or under the laws of the United
              States;
            </li>
            <li>An estate (other than a foreign estate); or</li>
            <li>
              A domestic trust (as defined in Regulations section 301.7701-7).
            </li>
          </ul>

          {/* Adjusted heading size */}
          <h2 className="text-sm font-bold mb-2">
            Establishing U.S. status for purposes of chapter 3 and chapter 4
            withholding.
          </h2>
          <p className="mb-4">
            Payments made to foreign persons, including certain distributions,
            allocations of income, or transfers of sales proceeds, may be
            subject to withholding under chapter 3 or chapter 4 of the Code
            (sections 1441-1474). Under those rules, if a Form W-9 or other
            certification of non-foreign status has not been received, a
            withholding agent, transferee, or partnership (payor) generally
            applies presumption rules that may require the payor to withhold
            applicable tax from the recipient, owner, transferor, or partner
            (payee). See{" "}
            <span className="italic">
              Pub. 515, Withholding of Tax on Nonresident Aliens and Foreign
              Entities.
            </span>
          </p>
          <p className="mb-4">
            The following persons must provide Form W-9 to the payor for
            purposes of establishing its non-foreign status.
          </p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>
              In the case of a disregarded entity with a U.S. owner, the U.S.
              owner of the disregarded entity and not the disregarded entity.
            </li>
            <li>
              In the case of a grantor trust with a U.S. grantor or other U.S.
              owner, generally, the U.S. grantor or other U.S. owner of the
              grantor trust and not the grantor trust.
            </li>
            <li>
              In the case of a U.S. trust (other than a grantor trust), the U.S.
              trust and not the beneficiaries of the trust.
            </li>
          </ul>
          {/* Gap reduced as requested */}
          <p className="mb-4 mt-2">
            See <span className="italic">Pub. 515</span> for more information on
            providing a Form W-9 or a certification of non-foreign status to
            avoid withholding.
          </p>
        </div>

        {/* Column 2 */}
        <div>
          {/* Adjusted heading size */}
          <h2 className="text-sm font-bold mb-2">Foreign person.</h2>
          <p className="mb-4">
            If you are a foreign person or the U.S. branch of a foreign bank
            that has elected to be treated as a U.S. person (under Regulations
            section 1.1441-1(b)(2)(iv) or other applicable section for chapter 3
            or 4 purposes), do not use Form W-9. Instead, use the appropriate
            Form W-8 or Form 8233 (see <span className="italic">Pub. 515</span>
            ). If you are a qualified foreign pension fund under Regulations
            section 1.897(1)-1(d), or a partnership that is wholly owned by
            qualified foreign pension funds, that is treated as a non-foreign
            person for purposes of section 1445 withholding, do not use Form
            W-9. Instead, use Form W-8EXP (or other certification of non-foreign
            status).
          </p>

          {/* Adjusted heading size */}
          <h2 className="text-sm font-bold mb-2">
            Nonresident alien who becomes a resident alien.
          </h2>
          <p className="mb-4">
            Generally, only a nonresident alien individual may use the terms of
            a tax treaty to reduce or eliminate U.S. tax on certain types of
            income. However, most tax treaties contain a provision known as a
            saving clause. Exceptions specified in the saving clause may permit
            an exemption from tax to continue for certain types of income even
            after the payee has otherwise become a U.S. resident alien for tax
            purposes.
          </p>
          <p className="mb-4">
            If you are a U.S. resident alien who is relying on an exception
            contained in the saving clause of a tax treaty to claim an exemption
            from U.S. tax on certain types of income, you must attach a
            statement to Form W-9 that specifies the following five items.
          </p>
          <ol className="list-decimal pl-8 mb-4 space-y-1">
            <li>
              The treaty country. Generally, this must be the same treaty under
              which you claimed exemption from tax as a nonresident alien.
            </li>
            <li>The treaty article addressing the income.</li>
            <li>
              The article number (or location) in the tax treaty that contains
              the saving clause and its exceptions.
            </li>
            <li>
              The type and amount of income that qualifies for the exemption
              from tax.
            </li>
            <li>
              Sufficient facts to justify the exemption from tax under the terms
              of the treaty article.
            </li>
          </ol>

          <p className="mb-4">
            <span className="font-bold">Example.</span> Article 20 of the
            U.S.-China income tax treaty allows an exemption from tax for
            scholarship income received by a Chinese student temporarily present
            in the United States. Under U.S. law, this student will become a
            resident alien for tax purposes if their stay in the United States
            exceeds 5 calendar years. However, paragraph 2 of the first Protocol
            to the U.S.-China treaty (dated April 30, 1984) allows the
            provisions of Article 20 to continue to apply even after the Chinese
            student becomes a resident alien of the United States. A Chinese
            student who qualifies for this exception (under paragraph 2 of the
            first Protocol) and is relying on this exception to claim an
            exemption from tax on their scholarship or fellowship income would
            attach to Form W-9 a statement that includes the information
            described above to support that exemption.
          </p>
          <p className="mb-4">
            If you are a nonresident alien or a foreign entity, give the
            requester the appropriate completed Form W-8 or Form 8233.
          </p>
          {/* Backup Withholding Section */}
          <div>
            {/* This heading is larger in the image */}
            <h2 className="text-lg font-bold mb-3">Backup Withholding</h2>

            {/* Adjusted heading size */}
            <h3 className="text-sm font-bold mb-2">
              What is backup withholding?
            </h3>
            <p className="mb-4">
              Persons making certain payments to you must under certain
              conditions withhold and pay to the IRS 24% of such payments. This
              is called "backup withholding." Payments that may be subject to
              backup withholding include, but are not limited to, interest,
              tax-exempt interest, dividends, broker and barter exchange
              transactions, rents, royalties, nonemployee pay, payments made in
              settlement of payment card and third-party network transactions,
              and certain payments from fishing boat operators. Real estate
              transactions are not subject to backup withholding.
            </p>
            <p className="mb-4">
              You will not be subject to backup withholding on payments you
              receive if you give the requester your correct TIN, make the
              proper certifications, and report all your taxable interest and
              dividends on your tax return.
            </p>
            <p className="mb-4">
              <span className="font-bold">
                Payments you receive will be subject to backup withholding if:
              </span>
            </p>
            <ol className="list-decimal pl-8 mb-4 space-y-1">
              <li>You do not furnish your TIN to the requester,</li>
              <li>
                You do not certify your TIN when required (see the instructions
                for Part II for details);
              </li>
              <li>
                The IRS tells the requester that you furnished an incorrect TIN;
              </li>
              <li>
                The IRS tells you that you are subject to backup withholding
                because you did not report all your interest and dividends on
                your tax return (for reportable interest and dividends only); or
              </li>
              <li>
                You do not certify to the requester that you are not subject to
                backup withholding, as described in item 4 under "By signing the
                filled-out form" above (for reportable interest and dividend
                accounts opened after 1983 only).
              </li>
            </ol>
          </div>
        </div>
      </div>{" "}
      {/* End of grid div */}
    </div> /* End of white-bg div */
  );
}
// --- Page 3 Component ---
function Page3() {
  return (
    <div className="max-w-6xl mx-auto bg-white p-6 md:p-10 shadow-lg font-sans text-black">
      {/* Header Section - smaller font */}
      <header className="flex justify-between items-center pb-1">
        <h1 className="text-base font-bold">Form W-9 (Rev. 3-2024)</h1>
        <span className="text-base font-bold">Page 3</span>
      </header>
      {/* The dividing line */}
      <hr className="border-t-2 border-black mb-4" />

      {/* Main Content - Two Columns - tighter gap */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
        {/* ----- Left Column (ALL content) ----- */}
        <div className="text-xs leading-normal">
          {/* Top introductory text - smaller font */}
          <p className="mb-1.5">
            Certain payees and payments are exempt from backup withholding. See{" "}
            <em className="italic">Exempt payee code</em> later and the separate
            Instructions for the Requestor of Form W-9 for more information.
          </p>
          <p className="mb-4">
            See also{" "}
            <em className="italic">
              Establishing U.S. status for purposes of chapter 3 and chapter 4
              withholding
            </em>
            , earlier.
          </p>
          <section className="mb-3">
            {/* Headings smaller */}
            <h2 className="text-base font-bold mb-1">
              What Is FATCA Reporting?
            </h2>
            <p className="mb-1.5">
              The Foreign Account Tax Compliance Act (FATCA) requires a
              participating foreign financial institution to report all U.S.
              account holders that are specified U.S. persons. Certain payees
              are exempt from FATCA reporting. See{" "}
              <em className="italic">Exemption from FATCA reporting code</em>{" "}
              later in the instructions and the Instructions for the Requestor
              of Form W-9 for more information.
            </p>
          </section>
          <section className="mb-3">
            <h2 className="text-base font-bold mb-1">
              Updating Your Information
            </h2>
            <p className="mb-1.5">
              You must provide updated information to any person to whom you are
              claiming to be an exempt payee if you are no longer an exempt
              payee and anticipate receiving reportable payments in the future
              from this person. For example, you may need to provide updated
              information if you are a C corporation that elects to be an S
              corporation, or if you are no longer tax exempt. In addition, you
              must furnish a new Form W-9 if the name or TIN changes for the
              account; for example, if the grantor of a grantor trust dies.
            </p>
          </section>
          <section className="mb-3">
            <h2 className="text-base font-bold mb-1">Penalties</h2>
            <p className="mb-1.5">
              <strong className="font-bold">Failure to furnish TIN.</strong> If
              you fail to furnish your correct TIN to a requestor, you are
              subject to a penalty of $50 for each such failure unless your
              failure is due to reasonable cause and not to willful neglect.
            </p>
            <p className="mb-1.5">
              <strong className="font-bold">
                Civil penalty for false information with respect to withholding.
              </strong>{" "}
              If you make a false statement with no reasonable basis that
              results in no backup withholding, you are subject to a $500
              penalty.
            </p>
            <p className="mb-1.5">
              <strong className="font-bold">
                Criminal penalty for falsifying information.
              </strong>{" "}
              Willfully falsifying certifications or affirmations may subject
              you to criminal penalties including fines and/or imprisonment.
            </p>
            <p>
              <strong className="font-bold">Misuse of TINs.</strong> If the
              requestor discloses or uses TINs in violation of federal law, the
              requestor may be subject to civil and criminal penalties.
            </p>
          </section>
          <section className="mb-3">
            <h2 className="text-base font-bold mb-1">Specific Instructions</h2>
            <h3 className="text-base font-bold mb-1">Line 1</h3>
            <p className="mb-1.5">
              You must enter one of the following on this line;{" "}
              <strong className="font-bold">do not</strong> leave this line
              blank. The name should match the name on your tax return.
            </p>
            <p className="mb-1.5">
              If this Form W-9 is for a joint account (other than an account
              maintained by a foreign financial institution (FFI)), list first,
              and then circle, the name of the person or entity whose number you
              entered in Part I of Form W-9. If you are providing Form W-9 to an
              FFI to document a joint account, each holder of the account that
              is a U.S. person must provide a Form W-9.
            </p>
            <p className="mb-1.5">
              <strong className="font-bold">a. Individual.</strong> Generally,
              enter the name shown on your tax return. If you have changed your
              last name without informing the Social Security Administration
              (SSA) of the name change, enter your first name, the last name as
              shown on your social security card, and your new last name.
            </p>
            <p className="mb-1.5">
              <strong className="font-bold">Note for ITIN applicant:</strong>{" "}
              Enter your individual name as it was entered on your Form W-7
              application, line 1a. This should also be the same as the name you
              entered on the Form 1040/1040-SR/1040-NR you filed with your
              application.
            </p>
            <p className="mb-1.5">
              <strong className="font-bold">b. Sole proprietor.</strong> Enter
              your individual name as shown on your Form 1040/1040-SR/1040-NR on
              line 1. Enter your business, trade, or “doing business as” (DBA)
              name on line 2.
            </p>
            <p className="mb-1.5">
              <strong className="font-bold">
                c. Partnership, C corporation, S corporation, or LLC, other than
                a disregarded entity.
              </strong>{" "}
              Enter the entity's name as shown on the entity's tax return on
              line 1 and any business, trade, or DBA name on line 2.
            </p>
            <p className="mb-1.5">
              <strong className="font-bold">d. Other entities.</strong> Enter
              your name as shown on required U.S. federal tax documents on line
              1. This name should match the name shown on the charter or other
              legal document creating the entity. Enter any business, trade, or
              DBA name on line 2.
            </p>
            <p className="mb-1.5">
              <strong className="font-bold">e. Disregarded entity.</strong> In
              general, a business entity that has a single owner (including an
              LLC) and is not a corporation is disregarded as an entity separate
              from its owner (a disregarded entity). See Regulations section
              301.7701-2(c)(2). A disregarded entity should check the
              appropriate box for the tax classification of its owner. Enter the
              owner's name on line 1. The name of the owner entered on line 1
              should never be a disregarded entity. The name on line 1 should be
              the name shown on the income tax return on which the income should
              be reported. For
              {/* This text now properly flows to the top of the right column */}
            </p>
          </section>
        </div>
        {/* ----- Right Column (ALL content) ----- */}
        <div className="text-xs leading-normal">
          {/* Continuation text (from left col) */}
          <p className="mb-1.5">
            example, if a foreign LLC that is treated as a disregarded entity
            for U.S. federal tax purposes has a single owner that is a U.S.
            person, the U.S. owner's name is required to be provided on line 1.
            If the direct owner of the entity is also a disregarded entity,
            enter the first owner that is not disregarded for federal tax
            purposes. Enter the disregarded entity's name on line 2. If the
            owner of the disregarded entity is a foreign person, the owner must
            complete an appropriate Form W-8 instead of a Form W-9. This is the
            case even if the foreign person has a U.S. TIN.
          </p>

          <section className="mb-3">
            <h3 className="text-base font-bold mb-1">Line 2</h3>
            <p>
              If you have a business name, trade name, DBA name, or disregarded
              entity name, enter it on line 2.
            </p>
          </section>

          <section className="mb-3">
            <h3 className="text-base font-bold mb-1">Line 3a</h3>
            <p className="mb-1.5">
              Check the appropriate box on line 3a for the U.S. federal tax
              classification of the person whose name is entered on line 1.
              Check only one box on line 3a.
            </p>
            {/* Table-like structure - tighter padding and margin */}
            <div className="border-2 border-black my-2">
              {/* Header Row */}
              <div className="flex font-bold text-left">
                <div className="w-1/2 p-1 border-b-2 border-r-2 border-black">
                  IF the entity/individual on line 1 is A(N)...
                </div>
                <div className="w-1/2 p-1 border-b-2 border-black">
                  THEN check the box for . . .
                </div>
              </div>
              {/* Data Rows */}
              <div className="flex">
                <div className="w-1/2 p-1 border-r-2 border-black">
                  <ul className="list-disc list-outside pl-4">
                    <li>Individual</li>
                    <li>Corporation</li>
                    <li>Sole proprietorship</li>
                  </ul>
                </div>
                <div className="w-1/2 p-1">
                  Corporation
                  <br />
                  Individual/sole proprietor.
                </div>
              </div>
              <div className="flex border-t-2 border-black">
                <div className="w-1/2 p-1 border-r-2 border-black">
                  <ul className="list-disc list-outside pl-4">
                    <li>
                      LLC treated as a partnership for U.S. federal tax purposes
                    </li>
                  </ul>
                </div>
                <div className="w-1/2 p-1">
                  Limited liability company and enter the appropriate tax
                  classification.
                </div>
              </div>
              <div className="flex border-t-2 border-black">
                <div className="w-1/2 p-1 border-r-2 border-black">
                  <ul className="list-disc list-outside pl-4">
                    <li>
                      LLC that has filed Form 8832 or 2553 (or is electing to be
                      taxed as a corporation)
                    </li>
                  </ul>
                </div>
                <div className="w-1/2 p-1">
                  <ul className="list-none">
                    <li>P = Partnership</li>
                    <li>C = C corporation, or</li>
                    <li>S = S corporation.</li>
                  </ul>
                </div>
              </div>
              <div className="flex border-t-2 border-black">
                <div className="w-1/2 p-1 border-r-2 border-black">
                  <ul className="list-disc list-outside pl-4">
                    <li>Partnership</li>
                  </ul>
                </div>
                <div className="w-1/2 p-1">Partnership.</div>
              </div>
              <div className="flex border-t-2 border-black">
                <div className="w-1/2 p-1 border-r-2 border-black">
                  <ul className="list-disc list-outside pl-4">
                    <li>Trust/estate</li>
                  </ul>
                </div>
                <div className="w-1/2 p-1">Trust/estate.</div>
              </div>
            </div>
          </section>

          <section className="mb-3">
            <h3 className="text-base font-bold mb-1">Line 3b</h3>
            <p className="mb-1.5">
              Check this box if you are a partnership (including an LLC
              classified as a partnership for U.S. federal tax purposes), trust,
              or estate that has foreign partners, owners, or beneficiaries, and
              you are providing this Form W-9 to document a U.S. partner's,
              owner's or beneficiary's interest. You must check the box on line
              3b if you receive a Form W-8 ben (or other W-8 series form) or
              Form W-9 from any partner, beneficiary or owner establishing
              foreign status or if you receive a Form W-9 from any partner,
              owner, or beneficiary that has checked the box on line 3b.
            </p>
            <p className="mb-1.5">
              <strong className="font-bold">Note:</strong> A partnership that
              provides a Form W-9 check box on 3b may be required to complete
              Schedules K-2 and K-3 (Form 1065). For more information, see the
              partnership instructions for Schedules K-2 and K-3 (Form 1065).
            </p>
            <p className="mb-1.5">
              If you are required to complete line 3b but fail to do so, you may
              not rely on the Form W-9 to treat a U.S. partner, owner, or
              beneficiary as exempt from the IRS or furnish a correct payee
              statement to your partners or beneficiaries. See, for example,
              sections 6698, 6722, and 6724 for penalties that may apply.
            </p>
          </section>
          <section className="mb-3">
            <h3 className="text-base font-bold mb-1">Line 4 Exemptions</h3>
            <p className="mb-1.5">
              If you are exempt from backup withholding and/or FATCA reporting,
              enter in the appropriate space on line 4 any code(s) that may
              apply to you.
            </p>
            <p className="mb-1.5">
              <strong className="font-bold">Exempt payee code.</strong>
            </p>
            {/* Tighter list spacing */}
            <ul className="list-disc list-outside pl-4 space-y-1">
              <li>
                Generally, individuals (including sole proprietors) are not
                exempt from backup withholding.
              </li>
              <li>
                Except as provided below, corporations are exempt from backup
                withholding for certain payments, including interest and
                dividends.
              </li>
              <li>
                Corporations are not exempt from backup withholding for payments
                made in settlement of payment card or third party network
                transactions.
              </li>
              <li>
                Corporations are not exempt from backup withholding with respect
                to attorneys' fees or gross proceeds paid to attorneys, and
                corporations that provide medical or health care services are
                not exempt with respect to payments reportable on Form
                1099-MISC.
              </li>
            </ul>
            <p className="mt-1.5 mb-1.5">
              The following codes identify payees that are exempt from backup
              withholding. Enter the appropriate code in the space on line 4.
            </p>
            <p className="mt-1.5">
              <strong className="font-bold">1</strong> - An organization exempt
              from tax under section 501(a), any IRA, or a custodial account
              under section 403(b)(7) if the account satisfies the requirements
              of section 401(f)(2).
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
// --- Page 4 Component ---
function Page4() {
  return (
    // This is the Page Container from the user's code, now the component's root
    <div className="max-w-6xl mx-auto bg-white p-6 md:p-10 shadow-lg border border-gray-300 font-serif text-black">
      {/* Header */}
      <header className="flex justify-between items-center border-b border-black pb-2 mb-4">
        <h1 className="font-bold text-sm">
          Form W-9 <span className="font-normal">(Rev. 3-2024)</span>
        </h1>
        <h2 className="font-bold text-sm">Page 4</h2>
      </header>
      {/* Main Content - Changed back to leading-normal */}
      <main className="text-xs leading-normal">
        {/* Main Content Grid (Left and Right Columns) - Reduced gap, no extra right padding */}
        <div className="grid grid-cols-1 md:grid-cols-2 md:gap-x-4">
          {/* Left Column (Lists 2-13, Table, Footnotes, A-E) */}
          <div className="space-y-4">
            {/* Lists 2-13 */}
            <ol start="2" className="list-decimal list-outside pl-5 space-y-1">
              <li>
                The United States or any of its agencies or instrumentalities.
              </li>
              <li>
                A state, the District of Columbia, a U.S. commonwealth or
                territory, or any of their political subdivisions or
                instrumentalities.
              </li>
              <li>
                A foreign government or any of its political subdivisions,
                agencies, or instrumentalities.
              </li>
              <li>A corporation.</li>
              <li>
                A dealer in securities or commodities required to register in
                the United States, the District of Columbia, or a U.S.
                commonwealth or territory.
              </li>
              <li>
                A futures commission merchant registered with the Commodity
                Futures Trading Commission.
              </li>
              <li>A real estate investment trust.</li>
              <li>
                An entity registered at all times during the tax year under the
                Investment Company Act of 1940.
              </li>
              <li>
                A common trust fund operated by a bank under section 584(a).
              </li>
              <li>A financial institution as defined in section 581.</li>
              <li>
                A middleman known in the investment community as a nominee or
                custodian.
              </li>
              <li>
                A trust exempt from tax under section 664 or described in
                section 4947.
              </li>
            </ol>

            {/* Chart Intro Paragraph */}
            <p>
              The following chart shows types of payments that may be exempt
              from backup withholding. The chart applies to the exempt payees
              listed above, 1 through 13.
            </p>
            {/* Exemption Table - Added table-fixed, text-[11px], leading-normal */}
            <table className="w-full my-4 border-collapse border border-black table-fixed text-[11px] leading-normal">
              <thead className="bg-gray-50">
                <tr>
                  {/* Added w-1/2 to force equal width */}
                  <th className="border border-black p-2 text-left font-bold align-top w-1/2">
                    If the payment is for . . .
                  </th>
                  <th className="border border-black p-2 text-left font-bold align-top w-1/2">
                    THEN the payment is exempt for . . .
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-black p-2 align-top">
                    <ul className="list-disc list-outside pl-5">
                      <li>Interest and dividend payments</li>
                    </ul>
                  </td>
                  <td className="border border-black p-2 align-top">
                    All exempt payees except for 7.
                  </td>
                </tr>
                <tr>
                  <td className="border border-black p-2 align-top">
                    <ul className="list-disc list-outside pl-5">
                      <li>Broker transactions</li>
                    </ul>
                  </td>
                  <td className="border border-black p-2 align-top">
                    Exempt payees 1 through 4 and 6 through 11 and all C
                    corporations. S corporations must not enter an exempt payee
                    code because they are exempt only for sales of noncovered
                    securities acquired prior to 2012.
                  </td>
                </tr>
                <tr>
                  <td className="border border-black p-2 align-top">
                    <ul className="list-disc list-outside pl-5">
                      <li>
                        Barter exchange transactions and patronage dividends
                      </li>
                    </ul>
                  </td>
                  <td className="border border-black p-2 align-top">
                    Exempt payees 1 through 4.
                  </td>
                </tr>
                <tr>
                  <td className="border border-black p-2 align-top">
                    <ul className="list-disc list-outside pl-5">
                      <li>
                        Payments over $600 required to be reported and direct
                        sales over $5,000¹
                      </li>
                    </ul>
                  </td>
                  <td className="border border-black p-2 align-top">
                    Generally, exempt payees 1 through 5.²
                  </td>
                </tr>
                <tr>
                  <td className="border border-black p-2 align-top">
                    <ul className="list-disc list-outside pl-5">
                      <li>
                        Payments made in settlement of payment card or
                        third-party network transactions
                      </li>
                    </ul>
                  </td>
                  <td className="border border-black p-2 align-top">
                    Exempt payees 1 through 4.
                  </td>
                </tr>
              </tbody>
            </table>
            {/* Footnotes and FATCA Info */}
            <div className="space-y-2">
              <p>
                ¹See Form 1099-MISC, Miscellaneous Information, and its
                instructions.
              </p>
              <p>
                ²However, the following payments made to a corporation and
                reportable on Form 1099-MISC are not exempt from backup
                withholding: medical and health care payments, attorneys' fees,
                gross proceeds paid to an attorney reportable under section
                6045(f), and payments for services paid by a federal executive
                agency.
              </p>
              <p>
                <strong className="font-bold">
                  Exemption from FATCA reporting code.
                </strong>{" "}
                The following codenamed payees are exempt from reporting under
                FATCA. These codes apply to persons submitting this form for
                accounts maintained outside of the United States by certain
                foreign financial institutions. Therefore, if you are only
                submitting this form for an account you hold in the
                UnitedStates, you may leave this field blank. Consult with the
                person requesting this form if you are uncertain if the
                financial institution is subject to these requirements. A
                requester may indicate that a code is not required by providing
                you with a Form W-9 with "Not Applicable" (or any similar
                indication) written or typed on the line for a FATCA exemption
                code.
              </p>
              <ul className="list-none space-y-1 pl-4">
                <li>
                  A—An organization exempt from tax under section 501(a) or any
                  individual retirement plan as defined in section 7701(a)(37).
                </li>
                <li>
                  B—The United States or any of its agencies or
                  instrumentalities.
                </li>
                <li>
                  C—A state, the District of Columbia, a U.S. commonwealth or
                  territory, or any of their political subdivisions or
                  instrumentalities.
                </li>
                <li>
                  D—A corporation the stock of which is regularly traded on one
                  or more established securities markets, as described in
                  Regulations section 1.1472-1(c)(1)(i).
                </li>
                <li>
                  E—A corporation that is a member of the same expanded
                  affiliated group as a corporation described in Regulations
                  section 1.1472-1(c)(1)(i).
                </li>
              </ul>
            </div>
          </div>
          {/* Right Column (Lists F-K, Note, Line 5, 6, Part I) */}
          <div className="space-y-3">
            {/* Lists F-K and Note */}
            <ul className="list-none space-y-1">
              <li>
                F—A dealer in securities, commodities, or derivative financial
                instruments (including notional principal contracts, futures,
                forwards, and options) registered as such under the laws of the
                United States or any state.
              </li>
              <li>G—A real estate investment trust.</li>
              <li>
                H—An entity registered at all times during the tax year under
                the Investment Company Act of 1940.
              </li>
              <li>I—A common trust fund as defined in section 584(a).</li>
              <li>J—A bank as defined in section 581.</li>
              <li>K—A broker.</li>
              <li>
                L—A trust exempt from tax under section 664(c) or described in
                section 4947(a)(1).
              </li>
              <li>
                M—A tax-exempt trust under a section 403(b) plan or section
                457(g) plan.
              </li>
              <li className="mt-2">
                <strong className="font-bold">Note:</strong> You may wish to
                consult with the financial institution requesting this form to
                determine whether the FATCA code and/or exempt payee code should
                be completed.
              </li>
            </ul>
            {/* Line 5 */}
            <div>
              <strong className="font-bold block text-sm mb-1">Line 5</strong>
              <p>
                Enter your address (number, street, and apartment or suite
                number). This is where the requester of this Form W-9 will mail
                your information returns. If this address differs from the one
                the requester already has on file, write "NEW" at the top. If a
                new address is provided, there isn't a chance the old address
                will be used until the payor changes your address in their
                records.
              </p>
            </div>
            {/* Line 6 */}
            <div>
              <strong className="font-bold block text-sm mb-1">Line 6</strong>
              <p>Enter your city, state, and ZIP code.</p>
            </div>
            {/* Part I - Added space-y-2 to add gaps between paragraphs */}
            <div className="space-y-2">
              <strong className="font-bold block text-sm mb-1">
                Part I. Taxpayer Identification Number (TIN)
              </strong>
              {/* All paragraphs are now siblings. pl-4 is added to all except the first for indentation. */}
              <p>
                Enter your TIN in the appropriate box. If you are a resident
                alien and you do not have and are not eligible to get an SSN,
                your TIN is your IRS ITIN. Enter it in the entry space for the
                social security number. If you do not have an ITIN, see{" "}
                <em className="italic">How to get a TIN</em> below.
              </p>
              <p className="pl-4">
                If you are a sole proprietor and you have an EIN, you may enter
                either your SSN or EIN.
              </p>
              <p className="pl-4">
                If you are a single-member LLC that is disregarded as an entity
                separate from its owner, enter the owner's SSN (or EIN, if the
                owner has one). If the LLC is classified as a corporation or
                partnership, enter the entity's EIN.
              </p>
              <p className="pl-4">
                <strong className="font-bold">Note:</strong> See{" "}
                <em className="italic">
                  What Name and Number To Give the Requester
                </em>
                , later, for further clarification of name and TIN combinations.
              </p>
              <p className="pl-4">
                <strong className="font-bold">How to get a TIN.</strong> If you
                do not have a TIN, apply for one immediately. To apply for an
                SSN, get Form SS-5, Application for a Social Security Card, from
                your local SSA office or get this form online at{" "}
                <em className="italic">www.SSA.gov</em>. You may also get this
                form by calling 800-772-1213. Use Form W-7, Application for IRS
                Individual Taxpayer Identification Number, to apply for an ITIN,
                or Form SS-4, Application for Employer Identification Number, to
                apply for an EIN. You can apply for an EIN online by accessing
                the IRS website at <em className="italic">www.irs.gov/EIN</em>.
                Go to <em className="italic">www.irs.gov/Forms</em> to view,
                download, or print Form W-7 and/or Form SS-4. Or, you can go to{" "}
                <em className="italic">www.irs.gov/OrderForms</em> to place an
                order and have Form W-7 and/or Form SS-4 mailed to you within 15
                business days.
              </p>
              <p className="pl-4">
                If you are asked to complete Form W-9 but do not have a TIN,
                apply for one in the space for the TIN, write "Applied For,"
                sign and date the form, and give it to the requester. For
                interest and dividend payments, and certain payments made with
                respect to readily tradable instruments, you will generally have
                60 days to get a TIN and give it to the requester before you are
                subject to backup withholding on payments. The 60-day rule does
                not apply to other types of payments. You will be subject to
                backup withholding on all such payments until you provide your
                TIN to the requester.
              </p>
              <p className="pl-4">
                {/* Fixed typo: font-Dold -> font-bold */}
                <strong className="font-bold">Note:</strong> Entering "Applied
                For" means that you have already applied for a TIN or that you
                intend to apply for one soon. See also{" "}
                <em className="italic">
                  Establishing U.S. status for purposes of chapter 3 and chapter
                  4 withholding
                </em>
                , earlier, for when you may instead be subject to withholding
                under chapter 3 or 4 of the Code.
              </p>
              <p className="pl-4">
                <strong className="font-bold">Caution:</strong> A disregarded
                U.S. entity that has a foreign owner must use the appropriate
                Form W-8.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
// --- Page 5 Component ---
function Page5() {
  return (
    // This is the Page Container from the user's code, now the component's root
    // Updated max-w-3xl to max-w-6xl for consistency
    <div className="max-w-6xl mx-auto bg-white p-6 md:p-10 shadow-lg border border-gray-300 font-serif text-black">
      {/* Header */}
      <header className="flex justify-between items-center border-b border-black pb-2 mb-4">
        <h1 className="font-bold text-sm">
          Form W-9 <span className="font-normal">(Rev. 3-2024)</span>
        </h1>
        <h2 className="font-bold text-sm">Page 5</h2>
      </header>
      {/* Main Content - text-xs and leading-normal for density */}
      <main className="text-xs leading-normal">
        {/* Main Content Grid (Left and Right Columns) */}
        <div className="grid grid-cols-1 md:grid-cols-2 md:gap-x-4">
          {/* --- LEFT COLUMN --- */}
          <div className="space-y-4">
            {/* Part II. Certification */}
            <div className="space-y-2">
              <h2 className="text-sm font-bold mb-1">Part II. Certification</h2>
              <p>
                To establish to the withholding agent that you are a U.S.
                person, or resident alien, sign Form W-9. You may be requested
                to sign by the withholding agent even if item 1, 4, or 5 below
                indicates a change.
              </p>
              <p>
                For a joint account, only the person whose TIN is shown in Part
                I should sign (when required). If you are a disregarded entity,
                the person identified on line 1 must sign. Exempt payees, see{" "}
                <em className="italic">Exempt payee code</em>, earlier.
              </p>
              <p>
                <strong className="font-bold">Signature requirements.</strong>{" "}
                Complete the certification as indicated in items 1 through 5
                below.
              </p>
            </div>
            {/* Certification List */}
            <ol className="list-decimal list-outside pl-5 space-y-2">
              <li>
                <strong className="font-bold">
                  Interest, dividend, and barter exchange accounts opened before
                  1984 and broker accounts considered active during 1983.
                </strong>
                You must give your correct TIN, but you do not have to sign the
                certification.
              </li>
              <li>
                <strong className="font-bold">
                  Interest, dividend, broker, and barter exchange accounts
                  opened after 1983 and broker accounts considered inactive
                  during 1983.
                </strong>{" "}
                You must sign the certification or backup withholding will
                apply. If you are subject to backup withholding and you are
                merely providing your correct TIN to the requester, you must
                cross out item 2 in the certification before signing the form.
              </li>
              <li>
                <strong className="font-bold">Real estate transactions.</strong>{" "}
                You must sign the certification. You may cross out item 2 of the
                certification.
              </li>
              <li>
                <strong className="font-bold">Other payments.</strong> You must
                give your correct TIN, but you do not have to sign the
                certification unless you have been notified that you have
                previously given an incorrect TIN. "Other payments" include
                payments made in the course of the requester's trade or business
                for rents, royalties, goods (other than bills for merchandise),
                medical and health care services (including payments to
                corporations), payments to a nonemployee for services, payments
                made in settlement of payment card or third party network
                transactions, payments to certain fishing boat crew members and
                fishermen, and gross proceeds paid to attorneys (including
                payments to corporations).
              </li>
              <li>
                <strong className="font-bold">
                  Mortgage interest paid by you, acquisition or abandonment of
                  secured property, cancellation of debt, qualified tuition
                  program payments (under section 529), ABLE accounts (under
                  section 529A), IRA, Coverdell ESA, Archer MSA or HSA
                  contributions or distributions, and pension distributions.
                </strong>{" "}
                You must give your correct TIN, but you do not have to sign the
                certification.
              </li>
            </ol>
            {/* What Name and Number Table (Left) */}
            <div className="space-y-2">
              <h2 className="text-sm font-bold mt-2">
                What Name and Number To Give the Requester
              </h2>

              <table className="w-full my-2 border-collapse border border-black table-fixed text-[11px] leading-normal">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="border border-black p-2 text-left font-bold align-top w-1/2">
                      For this type of account:
                    </th>
                    <th className="border border-black p-2 text-left font-bold align-top w-1/2">
                      Give name and SSN of:
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-black p-2 align-top">
                      1. Individual
                    </td>
                    <td className="border border-black p-2 align-top">
                      The individual
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-black p-2 align-top">
                      2. Two or more individuals (joint account) other than an
                      account maintained by an FFI
                    </td>
                    <td className="border border-black p-2 align-top">
                      The actual owner of the account or, if combined funds, the
                      first individual on the account
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-black p-2 align-top">
                      3. Two or more U.S. persons (joint account maintained by
                      an FFI)
                    </td>
                    <td className="border border-black p-2 align-top">
                      Each holder of the account
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-black p-2 align-top">
                      4. Custodial account of a minor (Uniform Gift to Minors
                      Act)
                    </td>
                    <td className="border border-black p-2 align-top">
                      The minor
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-black p-2 align-top">
                      5. a. The usual revocable savings trust (grantor is also
                      trustee) <br /> b. So-called trust account that is not a
                      legal or valid trust under state law
                    </td>
                    <td className="border border-black p-2 align-top">
                      The grantor-trustee¹
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-black p-2 align-top">
                      6. Sole proprietorship or disregarded entity owned by an
                      individual
                    </td>
                    <td className="border border-black p-2 align-top">
                      The actual owner¹
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-black p-2 align-top">
                      7. Grantor trust filing under Optional Form 1099 Filing
                      Method 1 (see Regulations section 1.671-4(b)(2)(i)(A))
                    </td>
                    <td className="border border-black p-2 align-top">
                      The grantor¹
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          {/* --- RIGHT COLUMN --- */}
          <div className="space-y-4">
            {/* What Name and Number Table (Right) */}
            <table className="w-full mt-0 border-collapse border border-black table-fixed text-[11px] leading-normal">
              <thead className="bg-gray-50">
                <tr>
                  <th className="border border-black p-2 text-left font-bold align-top w-1/2">
                    For this type of account:
                  </th>
                  <th className="border border-black p-2 text-left font-bold align-top w-1/2">
                    Give name and EIN of:
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-black p-2 align-top">
                    8. Disregarded entity not owned by an individual
                  </td>
                  <td className="border border-black p-2 align-top">
                    The owner
                  </td>
                </tr>
                <tr>
                  <td className="border border-black p-2 align-top">
                    9. A valid trust, estate, or pension trust
                  </td>
                  <td className="border border-black p-2 align-top">
                    Legal entity²
                  </td>
                </tr>
                <tr>
                  <td className="border border-black p-2 align-top">
                    10. Corporation or LLC electing corporate status on Form
                    8832 or Form 2553
                  </td>
                  <td className="border border-black p-2 align-top">
                    The corporation
                  </td>
                </tr>
                <tr>
                  <td className="border border-black p-2 align-top">
                    11. Association, club, religious, charitable, educational,
                    or other tax-exempt organization
                  </td>
                  <td className="border border-black p-2 align-top">
                    The organization
                  </td>
                </tr>
                <tr>
                  <td className="border border-black p-2 align-top">
                    12. Partnership or multi-member LLC
                  </td>
                  <td className="border border-black p-2 align-top">
                    The partnership
                  </td>
                </tr>
                <tr>
                  <td className="border border-black p-2 align-top">
                    13. A broker or nominee
                  </td>
                  <td className="border border-black p-2 align-top">
                    The broker or nominee
                  </td>
                </tr>
                <tr>
                  <td className="border border-black p-2 align-top">
                    14. Account with the Department of Agriculture in the name
                    of a public entity (such as a state or local government,
                    school district, or prison) that receives agricultural
                    program payments
                  </td>
                  <td className="border border-black p-2 align-top">
                    The public entity
                  </td>
                </tr>
                <tr>
                  <td className="border border-black p-2 align-top">
                    15. Grantor trust filing under Form 1041 or under the
                    Optional Form 1099 Filing Method 2 (see Regulations section
                    1.671-4(b)(2)(i)(B))
                  </td>
                  <td className="border border-black p-2 align-top">
                    The trust
                  </td>
                </tr>
              </tbody>
            </table>
            {/* Table Footnotes */}
            <div className="space-y-1 text-xs">
              <p>
                <sup>1</sup>List first and circle the name of the person whose
                number you furnish. If only one person on a joint account has an
                SSN, that person's number must be furnished.
              </p>
              <p>²Circle the minor's name and furnish the minor's SSN.</p>
              <p>
                ³You must show your individual name and you may also enter your
                business or DBA name on the "Business name/disregarded entity"
                name line. You may use either your SSN or EIN (if you have one),
                but the IRS encourages you to use your SSN.
              </p>
              <p>
                ⁴List first and circle the name of the trust, estate, or pension
                trust. (Do not furnish the TIN of the personal representative or
                trustee unless the legal entity itself is not designated in the
                account title.)
              </p>
              <p>
                *<strong className="font-bold">Note:</strong> The grantor also
                must provide a Form W-9 to the trustee of the trust.
              </p>
              <p>
                <strong className="font-bold">Note:</strong> For more
                information on optional filing methods for grantor trusts, see
                the Instructions for Form 1041.
              </p>
            </div>
            {/* Secure Your Tax Records */}
            <div className="space-y-2 pt-2">
              <h2 className="text-sm font-bold">
                Secure Your Tax Records From Identity Theft
              </h2>
              <p>
                Identity theft occurs when someone uses your personal
                information such as your name, SSN, or other identifying
                information, without your permission, to commit fraud or other
                crimes. An identity thief may use your SSN to get a job or may
                file a tax return using your SSN to receive a refund.
              </p>
              <p>To reduce your risk:</p>
              <ul className="list-disc list-outside pl-5 space-y-1">
                <li>Protect your SSN,</li>
                <li>Ensure your employer is protecting your SSN, and</li>
                <li>Be careful when choosing a tax return preparer.</li>
              </ul>
              <p>
                If your tax records are affected by identity theft and you
                receive a notice from the IRS, respond right away to the name
                and phone number printed on the IRS notice or letter.
              </p>
              <p>
                If your tax records are not currently affected by identity theft
                but you think you are at risk due to a lost or stolen purse or
                wallet, questionable credit card activity or credit report,
                contact the IRS Identity Theft Hotline at 1-800-908-4490 or
                submit Form 14039.
              </p>
              <p>
                For more information, see Pub. 5027, Identity Theft Information
                for Taxpayers.
              </p>
              {/* --- GEMINI FEATURE REMOVED --- */}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
// --- Page 6 Component ---
function Page6() {
  return (
    // This is the Page Container from the user's code, now the component's root
    // Updated max-w-3xl to max-w-6xl for consistency
    <div className="max-w-6xl mx-auto bg-white p-6 md:p-10 shadow-lg border border-gray-300 font-serif text-black">
      {/* Header */}
      <header className="flex justify-between items-center border-b border-black pb-2 mb-4">
        <h1 className="font-bold text-sm">
          Form W-9 <span className="font-normal">(Rev. 3-2024)</span>
        </h1>
        <h2 className="font-bold text-sm">Page 6</h2>
      </header>
      {/* Main Content - text-xs and leading-normal for density */}
      <main className="text-xs leading-normal">
        {/* Main Content Grid (Left and Right Columns) */}
        <div className="grid grid-cols-1 md:grid-cols-2 md:gap-x-4">
          {/* --- LEFT COLUMN --- */}
          <div className="space-y-4">
            {/* Victims of identity theft... */}
            <div className="space-y-2">
              <p>
                Victims of identity theft who are experiencing economic harm or
                a systemic problem, or are seeking help in resolving tax
                problems that have not been resolved through normal IRS
                channels, may contact the Taxpayer Advocate Service (TAS)
                assistance. You can reach TAS by calling the TAS toll-free case
                intake line at 877-777-4778 or TTY/TDD 800-829-4059.
              </p>
            </div>
            {/* Protect yourself from suspicious emails or phishing schemes. */}
            <div className="space-y-2">
              <strong className="font-bold block text-sm">
                Protect yourself from suspicious emails or phishing schemes.
              </strong>
              <p>
                Identity theft is the creation or use of email and websites
                designed to mimic legitimate business emails and websites. The
                most common act is to send an email to a user, falsely claiming
                to be an established legitimate enterprise in an attempt to
                scare the user into surrendering private information that can be
                used for identity theft.
              </p>
              <p>
                The IRS does not initiate contacts with taxpayers via emails.
                Also, the IRS does not request personal detailed information
                through email or ask a taxpayer for his/her financial or
                personal PIN from emails. Do not give out financial information,
                for their credit card, bank, or other financial accounts.
              </p>
              <p>
                If you receive an unsolicited email claiming to be from the IRS,
                forward this message to{" "}
                <em className="italic">phishing@irs.gov</em>. You may also
                report misuse of the IRS name, logo, or other IRS property to
                the Treasury Inspector General for Tax Administration (TIGTA) at
                800-366-4484. You can forward suspicious emails to the Federal
                Trade Commission at
                <em className="italic">www.ftc.gov/complaint</em>. Or you can
                write to FTC Consumer Response Center, 600 Pennsylvania Ave. NW,
                Washington, DC 20580.
              </p>
              <p>
                If you are a victim of identity theft, see{" "}
                <em className="italic">www.identityTheft.gov</em>, and Pub.
                5027.
              </p>
              <p>
                Go to <em className="italic">www.irs.gov/identityTheft</em> to
                learn more about identity theft and how to reduce your risk.
              </p>
            </div>
          </div>
          {/* --- RIGHT COLUMN --- */}
          <div className="space-y-4">
            {/* Privacy Act Notice */}
            <div className="space-y-2">
              <h2 className="text-sm font-bold mb-1">Privacy Act Notice</h2>
              <p>
                Section 6109 of the Internal Revenue Code requires you to
                provide your correct TIN to persons (including federal agencies)
                who are required to file information returns with the IRS to
                report interest, dividends, and certain other income paid to
                you, mortgage interest you paid, the acquisition or abandonment
                of secured property, the cancellation of debt, or contributions
                you made to an IRA, Archer MSA, or HSA. The IRS uses the TINs
                for identification purposes and to help to facilitate the
                matching of information returns with the appropriate tax
                returns. The IRS may also give this information to the
                Department of Justice for civil and criminal litigation and to
                cities, states, the District of Columbia, and U.S. commonwealths
                and territories for use in administering their laws. The
                information may also be disclosed to other countries under a
                treaty, to federal and state agencies to enforce civil and
                criminal laws, or to federal law enforcement and intelligence
                agencies to combat terrorism. You must provide your TIN whether
                or not you are required to file a tax return. Under section
                3406, payors must generally withhold a percentage of taxable
                interest, dividends, and certain other payments to a payee who
                does not give a TIN to the payor. Certain penalties may also
                apply for providing false or fraudulent information.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

const FORM_KEYS = [
  "employmentType",
  "personalInformation",
  "professionalExperience",
  "workExperience",
  "education",
  "references",
  "legalDisclosures",
  "jobDescriptionPCA",
  "codeOfEthics",
  "serviceDeliveryPolicy",
  "nonCompeteAgreement",
  "misconductStatement",
  "orientationPresentation",
  "orientationChecklist",
  "backgroundCheck",
  "tbSymptomScreen",
  "emergencyContact",
  "w4Form",
  "w9Form",
  "directDeposit",
];

export default function W9Form() {
  const navigate = useNavigate();
  const baseURL = import.meta.env.VITE__BASEURL;

  // Helper function to get total forms count based on employment type
  const getTotalFormsCount = (empType) => {
    if (!empType) return FORM_KEYS.length; // Default to all forms if no employment type selected yet
    // If W-2 employee, W4 is required, W9 is optional (not counted)
    // If 1099 contractor, W9 is required, W4 is optional (not counted)
    return FORM_KEYS.length; // For now, keep all forms but we'll filter in progress calculation
  };

  // Helper function to check if a form should be counted in progress
  const shouldCountForm = (formKey, empType) => {
    if (!empType) return true; // Count all if no employment type selected

    if (empType === "W-2") {
      // For W-2 employees, W4 is required, W9 is optional
      return formKey !== "w9Form";
    } else if (empType === "1099") {
      // For 1099 contractors, W9 is required, W4 is optional
      return formKey !== "w4Form";
    }

    return true; // Default to counting all
  };
  const [loading, setLoading] = useState(true);
  const [applicationId, setApplicationId] = useState(null);
  const [employeeId, setEmployeeId] = useState(null);
  const [overallProgress, setOverallProgress] = useState(0);
  const [completedFormsCount, setCompletedFormsCount] = useState(0);
  const [employmentType, setEmploymentType] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    businessName: "",
    taxClassification: "",
    llcClassification: "",
    otherClassification: "",
    foreignPartners: false,
    exemptPayeeCode: "",
    fatcaCode: "",
    address: "",
    requesterInfo: "",
    city: "",
    accountNumbers: "",
    // Use arrays for individual TIN digits (9 total for both SSN and EIN)
    ssn: Array(9).fill(""),
    ein: Array(9).fill(""),
    signature: "",
    signatureDate: "",
  });
  const [isFormCompleted, setIsFormCompleted] = useState(false);
  const [formStatus, setFormStatus] = useState("draft");
  const [hrFeedback, setHrFeedback] = useState(null);

  // Refs for TIN inputs
  const ssnInputs = useRef([]);
  const einInputs = useRef([]);

  useEffect(() => {
    initializeForm();
  }, []);

  useEffect(() => {
    if (applicationId) {
      loadW9FormData();
    }
  }, [applicationId]);

  const loadW9FormData = async () => {
    try {
      const response = await axios.get(
        `${baseURL}/onboarding/get-w9-form/${applicationId}`,
        { withCredentials: true }
      );

      if (response.data?.w9Form) {
        const data = response.data.w9Form;
        setFormData({
          name: data.name || "",
          businessName: data.businessName || "",
          taxClassification: data.taxClassification || "",
          llcClassification: data.llcClassification || "",
          otherClassification: "",
          foreignPartners: data.foreignPartners || false,
          exemptPayeeCode: data.exemptPayeeCode || "",
          fatcaCode: data.fatcaCode || "",
          address: data.address || "",
          requesterInfo: "",
          city: data.city || "",
          accountNumbers: data.accountNumbers || "",
          ssn: data.ssn || Array(9).fill(""),
          ein: data.ein || Array(9).fill(""),
          signature: data.signature || "",
          signatureDate: data.signatureDate
            ? new Date(data.signatureDate).toISOString().split("T")[0]
            : "",
        });
        // Set form status
        setFormStatus(data.status || "draft");
        setHrFeedback(data.hrFeedback || null);
        // Check if form has meaningful data
        const hasData =
          data.name ||
          data.businessName ||
          data.taxClassification ||
          data.address ||
          data.city ||
          data.signature ||
          (data.ssn && data.ssn.some((d) => d)) ||
          (data.ein && data.ein.some((d) => d));
        setIsFormCompleted(hasData);
      } else {
        setIsFormCompleted(false);
        setFormStatus("draft");
      }
    } catch (error) {
      if (error.response?.status !== 404) {
        console.error("Error loading W9 form:", error);
      }
    }
  };

  const initializeForm = async () => {
    try {
      const userToken = Cookies.get("session");
      const decodedToken = userToken && jwtDecode(userToken);
      const user = decodedToken?.user;

      if (!user?._id) {
        console.error("User not found in token");
        toast.error("Session expired. Please login again.");
        navigate("/login");
        return;
      }

      setEmployeeId(user._id);

      // Get application
      const appResponse = await axios.get(
        `${baseURL}/onboarding/get-application/${user._id}`,
        { withCredentials: true }
      );

      if (appResponse.data?.data?.application) {
        setApplicationId(appResponse.data.data.application._id);

        // Calculate progress
        const backendData = appResponse.data.data;
        const forms = backendData.forms || {};
        const completedFormsArray =
          backendData.application?.completedForms || [];
        const completedSet = new Set(completedFormsArray);
        const empType = backendData.application?.employmentType;

        setEmploymentType(empType);

        const completedForms = FORM_KEYS.filter((key) => {
          // Only count forms that should be counted based on employment type
          if (!shouldCountForm(key, empType)) return false;

          const form = forms[key];
          return (
            form?.status === "submitted" ||
            form?.status === "completed" ||
            form?.status === "under_review" ||
            form?.status === "approved" ||
            completedSet.has(key) ||
            (key === "employmentType" && empType)
          );
        }).length;

        const totalForms = FORM_KEYS.filter((key) =>
          shouldCountForm(key, empType)
        ).length;

        const percentage = Math.round((completedForms / totalForms) * 100);
        setOverallProgress(percentage);
        setCompletedFormsCount(completedForms);
      }
    } catch (error) {
      console.error("Error initializing form:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAndNext = async () => {
    try {
      // Check if form has any data
      const hasData =
        formData.name ||
        formData.businessName ||
        formData.taxClassification ||
        formData.address ||
        formData.city ||
        formData.ssn.some((d) => d) ||
        formData.ein.some((d) => d);

      const status = hasData ? "submitted" : "draft";

      await axios.post(
        `${baseURL}/onboarding/save-w9-form`,
        {
          applicationId,
          employeeId,
          formData,
          status,
        },
        { withCredentials: true }
      );

      // Dispatch event to refresh sidebar
      window.dispatchEvent(new Event("formStatusUpdated"));

      toast.success(hasData ? "Form saved successfully!" : "Progress saved");
      navigate("/employee/direct-deposit");
    } catch (error) {
      console.error("Error saving form:", error);
      toast.error("Failed to save form");
    }
  };

  const handlePrevious = () => {
    navigate("/employee/employment-type");
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleCheckbox = (classification) => {
    setFormData((prev) => ({ ...prev, taxClassification: classification }));
  };

  // New handler for single-digit TIN inputs
  const handleTinDigitChange = (e, index, type) => {
    const { value } = e.target;
    if (!/^\d*$/.test(value)) return; // Only allow digits

    const newTin = [...formData[type]];
    newTin[index] = value.slice(-1); // Get only the last digit
    setFormData((prev) => ({ ...prev, [type]: newTin }));

    // Auto-focus to next input
    if (value && index < 8) {
      const inputs = type === "ssn" ? ssnInputs.current : einInputs.current;
      if (inputs[index + 1]) {
        inputs[index + 1].focus();
      }
    }
  };

  // Handler for backspace
  const handleTinKeyDown = (e, index, type) => {
    if (e.key === "Backspace" && !formData[type][index] && index > 0) {
      const inputs = type === "ssn" ? ssnInputs.current : einInputs.current;
      if (inputs[index - 1]) {
        inputs[index - 1].focus();
      }
    }
  };

  // Helper to create TIN input fields
  const createTinInputs = (type, lengths) => {
    const inputRefs = type === "ssn" ? ssnInputs : einInputs;
    let digitIndex = 0;

    // Determine the grid classes based on the type
    const gridClass =
      type === "ssn"
        ? "tin-display-container-grid grid-ssn"
        : "tin-display-container-grid grid-ein";

    return (
      <div
        className={gridClass}
        style={{
          border: "1px solid black",
          height: "25px",
          overflow: "hidden",
        }}
      >
        {lengths.map((length, groupIndex) => (
          <React.Fragment key={groupIndex}>
            {Array.from({ length }, (_, i) => {
              const currentIndex = digitIndex++;

              // Determine if we need a right border
              let needsRightBorder = true;

              // Check if this input is the end of a group (and thus is adjacent to a separator)
              const isEndOfGroup =
                i === length - 1 && groupIndex < lengths.length - 1;

              // Check if this is the absolute last digit
              const isAbsoluteLastDigit = currentIndex === 8;

              if (isEndOfGroup || isAbsoluteLastDigit) {
                needsRightBorder = false;
              }

              const borderStyle = needsRightBorder ? "1px solid black" : "none";

              return (
                <input
                  key={`${type}-${currentIndex}`}
                  type="text"
                  name={`${type}${currentIndex}`}
                  value={formData[type][currentIndex]}
                  onChange={(e) => handleTinDigitChange(e, currentIndex, type)}
                  onKeyDown={(e) => handleTinKeyDown(e, currentIndex, type)}
                  maxLength="1"
                  // Using inline Tailwind classes for styling individual boxes
                  className={`w-full h-full text-center text-[11px] font-sans p-0 m-0 box-border`}
                  // Explicitly set border style to ensure vertical lines are visible
                  style={{
                    border: "none",
                    borderRight: borderStyle,
                    boxSizing: "border-box",
                  }}
                  ref={(el) => (inputRefs.current[currentIndex] = el)}
                />
              );
            })}
            {/* Add a separator (dash) if it's not the last group */}
            {groupIndex < lengths.length - 1 && (
              <span
                className="tin-separator-simple"
                // Tailwind for positioning and styling the dash
                style={{
                  width: "10px",
                  height: "100%",
                  fontWeight: "bold",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  fontSize: "11px",
                  boxSizing: "border-box",
                  // Ensure separator itself has dividing lines
                  borderLeft: "1px solid black",
                  borderRight: "1px solid black",
                }}
              >
                –
              </span>
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <Layout>
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-lg text-gray-600">Loading...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Navbar />
      <Toaster position="top-right" />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 pt-6 pb-8">
        <button
          onClick={() => navigate("/employee/task-management")}
          className="inline-flex items-center gap-2 px-4 py-2 text-white bg-gradient-to-r from-[#1F3A93] to-[#2748B4] rounded-lg hover:from-[#16306e] hover:to-[#1F3A93] transition-all duration-200 shadow-md mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {/* HR Feedback Section */}
        <HRFeedback hrFeedback={hrFeedback} formStatus={formStatus} />

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 sm:p-6 md:p-8">
          {/* Status Banner */}
          {!loading && (
            <div
              className={`mb-6 p-4 rounded-lg border ${
                isFormCompleted ||
                formStatus === "under_review" ||
                formStatus === "approved"
                  ? "bg-green-50 border-green-200"
                  : "bg-red-50 border-red-200"
              }`}
            >
              <div className="flex items-center justify-center gap-3">
                {isFormCompleted || formStatus === "approved" ? (
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                ) : formStatus === "under_review" ? (
                  <FileText className="w-6 h-6 text-blue-600 flex-shrink-0" />
                ) : (
                  <FileText className="w-6 h-6 text-red-600 flex-shrink-0" />
                )}
                <div>
                  {isFormCompleted ? (
                    <>
                      <p className="text-base font-semibold text-green-800">
                        ✅ Progress Updated - Form Completed Successfully
                      </p>
                      <p className="text-sm text-green-700 mt-1">
                        You cannot make any changes to the form until HR
                        provides their feedback.
                      </p>
                    </>
                  ) : formStatus === "approved" ? (
                    <p className="text-base font-semibold text-green-800">
                      ✅ Form Approved
                    </p>
                  ) : formStatus === "under_review" ? (
                    <p className="text-base font-semibold text-blue-800">
                      📋 Form Under Review
                    </p>
                  ) : (
                    <p className="text-base font-semibold text-red-800">
                      ⚠️ Not filled yet - Complete this form to update your
                      progress
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
              W-9 Form
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Request for Taxpayer Identification Number and Certification
            </p>
          </div>

          <div
            className="p-2 sm:p-4 bg-white text-black"
            style={{
              fontFamily: "'Times New Roman', Times, serif",
              fontSize: "12pt",
            }}
          >
            <style>{`
        input[type="text"] {
          outline: none;
          font-family: Arial, sans-serif;
          background: transparent;
        }
        
        input[type="checkbox"] {
          appearance: none;
          -webkit-appearance: none;
          -moz-appearance: none;
          width: 10px;
          height: 10px;
          border: 0.8px solid black;
          background-color: white;
          vertical-align: middle;
          margin: 0 3px 0 0;
          padding: 0;
          position: relative;
          display: inline-block;
          top: -1px;
        }
        
        input[type="checkbox"]:checked::after {
          content: 'X';
          font-family: Arial, sans-serif;
          font-weight: bold;
          font-size: 8px;
          color: black;
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          line-height: 1;
        }

        /* NEW TIN Box Styles: Using Grid for structure */
        .tin-display-container-grid {
          display: grid;
          align-items: center;
          width: 100%;
          box-sizing: border-box;
        }
        
        /* SSN (3-2-4 grouping, 9 digits + 2 dashes = 11 columns) */
        .grid-ssn {
             grid-template-columns: repeat(3, 1fr) 10px repeat(2, 1fr) 10px repeat(4, 1fr);
        }
        
        /* EIN (2-7 grouping, 9 digits + 1 dash = 10 columns) */
        .grid-ein {
             grid-template-columns: repeat(2, 1fr) 10px repeat(7, 1fr);
        }


        /* Specific style for TIN box labels */
        .tin-label {
          font-size: 8.5pt; 
          font-weight: bold;
          margin-bottom: 2px;
          border: 1px solid black; 
          border-bottom: none;
          padding: 2px 4px;
          display: inline-block;
          width: 100%; 
          box-sizing: border-box;
        }

        /* Responsive adjustments */
        @media (max-width: 640px) {
          .w9-form-container {
            font-size: 9pt !important;
          }
          .w9-header-title {
            font-size: 14pt !important;
          }
          .w9-form-w9 {
            font-size: 36pt !important;
          }
        }
      `}</style>

            <form>
              <div
                className="w9-form-container"
                style={{ border: "3px solid black" }}
              >
                {/* Top Header Row */}
                <div
                  className="flex flex-col sm:flex-row"
                  style={{ borderBottom: "3px solid black" }}
                >
                  {/* Form W-9 Section */}
                  <div
                    className="sm:border-r sm:border-b-0 border-b"
                    style={{
                      width: "100%",
                      padding: "6px 8px",
                      borderRight: "1px solid black",
                      fontFamily: "Arial, sans-serif",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "10pt",
                        lineHeight: "1",
                        marginBottom: "2px",
                      }}
                    >
                      Form
                    </div>
                    <div
                      className="w9-form-w9"
                      style={{
                        fontSize: "50pt",
                        fontWeight: "900",
                        lineHeight: "0.8",
                        fontFamily: "Arial Black, sans-serif",
                        letterSpacing: "-3px",
                      }}
                    >
                      W-9
                    </div>
                    <div
                      style={{
                        fontSize: "7.5pt",
                        lineHeight: "1.1",
                        marginTop: "2px",
                      }}
                    >
                      (Rev. March 2024)
                    </div>
                    <div style={{ fontSize: "7.5pt", lineHeight: "1.1" }}>
                      Department of the Treasury
                    </div>
                    <div style={{ fontSize: "7.5pt", lineHeight: "1.1" }}>
                      Internal Revenue Service
                    </div>
                  </div>

                  {/* Center Title */}
                  <div
                    className="flex-1 flex flex-col justify-center items-center text-center sm:border-r-0 sm:border-b-0 border-b"
                    style={{
                      padding: "10px 16px",
                      fontFamily: "Arial, sans-serif",
                    }}
                  >
                    <div
                      className="w9-header-title"
                      style={{
                        fontSize: "18pt",
                        fontWeight: "bold",
                        lineHeight: "1.05",
                      }}
                    >
                      Request for Taxpayer
                    </div>
                    <div
                      className="w9-header-title"
                      style={{
                        fontSize: "18pt",
                        fontWeight: "bold",
                        lineHeight: "1.05",
                      }}
                    >
                      Identification Number and Certification
                    </div>
                    <div
                      style={{
                        fontSize: "8.5pt",
                        marginTop: "6px",
                        lineHeight: "1.2",
                      }}
                    >
                      <span style={{ fontWeight: "bold" }}>
                        Go to{" "}
                        <span style={{ fontStyle: "italic" }}>
                          www.irs.gov/FormW9
                        </span>{" "}
                        for instructions and the latest information.
                      </span>
                    </div>
                  </div>

                  {/* Right Instructions */}
                  <div
                    className="sm:border-l border-t sm:border-t-0"
                    style={{
                      width: "100%",
                      padding: "6px 8px",
                      borderLeft: "1px solid black",
                      textAlign: "left",
                      fontWeight: "bold",
                      fontSize: "9.5pt",
                      lineHeight: "1.25",
                      fontFamily: "Arial, sans-serif",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "flex-start",
                    }}
                  >
                    <div>
                      <div>Give form to the</div>
                      <div>requester. Do not</div>
                      <div>send to the IRS.</div>
                    </div>
                  </div>
                </div>

                {/* Before you begin */}
                <div
                  style={{
                    padding: "5px 8px",
                    borderBottom: "1px solid black",
                    fontSize: "8.5pt",
                    lineHeight: "1.25",
                  }}
                >
                  <span style={{ fontWeight: "bold" }}>Before you begin.</span>{" "}
                  For guidance related to the purpose of Form W-9, see{" "}
                  <span style={{ fontStyle: "italic" }}>Purpose of Form</span>,
                  below.
                </div>

                {/* Main Content */}
                <div style={{ padding: "8px" }}>
                  {/* Line 1 (Full width, inside box) */}
                  <div style={{ marginBottom: "6px" }}>
                    <div
                      style={{
                        fontSize: "10pt",
                        marginBottom: "2px",
                        lineHeight: "1.2",
                      }}
                    >
                      <span style={{ fontWeight: "bold" }}>1</span>
                      &nbsp;&nbsp;Name of entity/individual. An entry is
                      required. (For a sole proprietor or disregarded entity,
                      enter the owner's name on line 1, and enter the
                      business/disregarded entity's name on line 2.))
                    </div>
                    <div
                      style={{
                        borderBottom: "1px solid black",
                        height: "22px",
                      }}
                    >
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        style={{
                          width: "100%",
                          border: "none",
                          height: "100%",
                          paddingLeft: "2px",
                          fontSize: "9pt",
                        }}
                      />
                    </div>
                  </div>

                  {/* Line 2 (Full width, inside box) */}
                  <div style={{ marginBottom: "6px" }}>
                    <div
                      style={{
                        fontSize: "10pt",
                        marginBottom: "2px",
                        lineHeight: "1.2",
                      }}
                    >
                      <span style={{ fontWeight: "bold" }}>2</span>
                      &nbsp;&nbsp;Business name/disregarded entity name, if
                      different from above.
                    </div>
                    <div
                      style={{
                        borderBottom: "1px solid black",
                        height: "22px",
                      }}
                    >
                      <input
                        type="text"
                        name="businessName"
                        value={formData.businessName}
                        onChange={handleChange}
                        style={{
                          width: "100%",
                          border: "none",
                          height: "100%",
                          paddingLeft: "2px",
                          fontSize: "9pt",
                        }}
                      />
                    </div>
                  </div>

                  {/* REFACTORED SECTION (Lines 3, 4, 5, 6, 7) - FLEX CONTAINER FOR COLUMNS AND LINE 7 */}
                  <div
                    style={{
                      border: "1px solid black",
                      marginBottom: "6px",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    {/* Row 1: Vertical Label and Two Main Columns */}
                    <div
                      className="flex flex-col sm:flex-row"
                      style={{ flexGrow: 1 }}
                    >
                      {/* Child 1: Vertical "Print or type" text */}
                      <div
                        className="hidden sm:flex"
                        style={{
                          width: "55px",
                          borderRight: "1px solid black",
                          padding: "6px 2px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontFamily: "Arial, sans-serif",
                          alignSelf: "stretch",
                          flexShrink: 0,
                        }}
                      >
                        <div
                          style={{
                            transform: "rotate(-90deg)",
                            whiteSpace: "nowrap",
                            fontSize: "8pt",
                            fontWeight: "bold",
                            width: "200px",
                            textAlign: "center",
                            lineHeight: "1.2",
                          }}
                        >
                          Print or type.
                          <br />
                          See Specific Instructions on page 3.
                        </div>
                      </div>

                      {/* Child 2: Main Content Area (Split into two columns) */}
                      <div
                        className="flex flex-col lg:flex-row"
                        style={{ flex: 1 }}
                      >
                        {/* Left Column (Line 3, 5, 6) - NARROWER (flex: 1.5) */}
                        <div
                          className="lg:border-r border-b lg:border-b-0"
                          style={{
                            flex: "1.5",
                            borderRight: "1px solid black",
                            display: "flex",
                            flexDirection: "column",
                          }}
                        >
                          {/* 3a and 3b content */}
                          <div style={{ padding: "6px 8px" }}>
                            <div
                              style={{
                                fontSize: "9pt",
                                marginBottom: "8px",
                                lineHeight: "1.2",
                              }}
                            >
                              <span style={{ fontWeight: "bold" }}>3a</span>
                              &nbsp;&nbsp;Check the appropriate box for federal
                              tax classification of the entity/individual whose
                              name is entered on line 1. Check{" "}
                              <span style={{ fontWeight: "bold" }}>
                                only one
                              </span>{" "}
                              of the following seven boxes.
                            </div>

                            {/* Checkboxes - All on one line */}
                            <div
                              style={{
                                fontSize: "9pt",
                                marginBottom: "10px",
                                fontFamily: "Arial, sans-serif",
                                display: "flex",
                                gap: "8px",
                                flexWrap: "wrap",
                              }}
                            >
                              <label
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                <input
                                  type="checkbox"
                                  checked={
                                    formData.taxClassification ===
                                    "individual_sole_proprietor"
                                  }
                                  onChange={() =>
                                    handleCheckbox("individual_sole_proprietor")
                                  }
                                />
                                <span>Individual/sole proprietor</span>
                              </label>
                              <label
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                <input
                                  type="checkbox"
                                  checked={
                                    formData.taxClassification ===
                                    "c_corporation"
                                  }
                                  onChange={() =>
                                    handleCheckbox("c_corporation")
                                  }
                                />
                                <span>C corporation</span>
                              </label>
                              <label
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                <input
                                  type="checkbox"
                                  checked={
                                    formData.taxClassification ===
                                    "s_corporation"
                                  }
                                  onChange={() =>
                                    handleCheckbox("s_corporation")
                                  }
                                />
                                <span>S corporation</span>
                              </label>
                              <label
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                <input
                                  type="checkbox"
                                  checked={
                                    formData.taxClassification === "partnership"
                                  }
                                  onChange={() => handleCheckbox("partnership")}
                                />
                                <span>Partnership</span>
                              </label>
                              <label
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                <input
                                  type="checkbox"
                                  checked={
                                    formData.taxClassification ===
                                    "trust_estate"
                                  }
                                  onChange={() =>
                                    handleCheckbox("trust_estate")
                                  }
                                />
                                <span>Trust/estate</span>
                              </label>
                            </div>

                            {/* LLC line */}
                            <div
                              style={{
                                fontSize: "9pt",
                                marginBottom: "10px",
                                fontFamily: "Arial, sans-serif",
                                display: "flex",
                                alignItems: "center",
                                gap: "3px",
                                flexWrap: "nowrap",
                              }}
                            >
                              <label
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                <input
                                  type="checkbox"
                                  checked={formData.taxClassification === "llc"}
                                  onChange={() => handleCheckbox("llc")}
                                />
                                <span>
                                  LLC. Enter the tax classification (C = C corp,
                                  S = S corp, P = Partnership) . . . .
                                </span>
                              </label>
                              <input
                                type="text"
                                name="llcClassification"
                                value={formData.llcClassification}
                                onChange={handleChange}
                                style={{
                                  width: "28px",
                                  height: "16px",
                                  border: "none",
                                  borderBottom: "1px solid black",
                                  textAlign: "center",
                                  fontSize: "9pt",
                                  flexShrink: 0,
                                }}
                                maxLength="1"
                                disabled={formData.taxClassification !== "llc"}
                              />
                            </div>

                            {/* Note */}
                            <div
                              style={{
                                fontSize: "7.5pt",
                                marginBottom: "10px",
                                marginLeft: "14px",
                                lineHeight: "1.15",
                              }}
                            >
                              <span style={{ fontWeight: "bold" }}>Note:</span>{" "}
                              Check the "LLC" box above and, in the entity
                              space, enter the appropriate code (C, S, or P) for
                              the tax classification of the LLC, unless it is a
                              disregarded entity. A disregarded entity should
                              instead check the appropriate box for the tax
                              classification of its owner.
                            </div>

                            {/* Other */}
                            <div
                              style={{
                                fontSize: "9pt",
                                marginBottom: "10px",
                                fontFamily: "Arial, sans-serif",
                                display: "flex",
                                alignItems: "center",
                                gap: "3px",
                                flexWrap: "wrap",
                              }}
                            >
                              <label
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                }}
                              >
                                <input
                                  type="checkbox"
                                  checked={
                                    formData.taxClassification === "other"
                                  }
                                  onChange={() => handleCheckbox("other")}
                                />
                                <span>Other (see instructions)</span>
                              </label>
                              <input
                                type="text"
                                name="otherClassification"
                                value={formData.otherClassification}
                                onChange={handleChange}
                                style={{
                                  width: "180px",
                                  height: "16px",
                                  border: "none",
                                  borderBottom: "1px solid black",
                                  textAlign: "center",
                                  fontSize: "9pt",
                                }}
                                disabled={
                                  formData.taxClassification !== "other"
                                }
                              />
                            </div>

                            {/* Line 3b */}
                            <div
                              style={{
                                fontSize: "9pt",
                                paddingTop: "5px",
                                borderTop: "1px solid black",
                                lineHeight: "1.2",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "flex-start",
                                gap: "8px",
                              }}
                            >
                              <span>
                                <span style={{ fontWeight: "bold" }}>3b</span>
                                &nbsp;&nbsp;If on line 3a you checked
                                "Partnership" or "Trust/estate," or checked
                                "LLC" and entered "P" as its tax classification,
                                and you are providing this form to a
                                partnership, trust, or estate in which you have
                                an ownership interest, check this box if you
                                have any foreign partners, owners, or
                                beneficiaries. See
                                instructions&nbsp;&nbsp;.&nbsp;&nbsp;.&nbsp;&nbsp;.&nbsp;&nbsp;.&nbsp;&nbsp;.&nbsp;&nbsp;.&nbsp;&nbsp;.&nbsp;&nbsp;.&nbsp;&nbsp;.&nbsp;&nbsp;.&nbsp;&nbsp;.&nbsp;&nbsp;.
                              </span>
                              <input
                                type="checkbox"
                                name="foreignPartners"
                                checked={formData.foreignPartners}
                                onChange={handleChange}
                                style={{ flexShrink: 0, marginTop: "2px" }}
                              />
                            </div>
                          </div>

                          {/* Line 5 */}
                          <div
                            style={{
                              borderTop: "1px solid black",
                              padding: "6px 8px",
                            }}
                          >
                            <div
                              style={{
                                fontSize: "9pt",
                                marginBottom: "2px",
                                lineHeight: "1.2",
                              }}
                            >
                              <span style={{ fontWeight: "bold" }}>5</span>
                              &nbsp;&nbsp;Address (number, street, and apt. or
                              suite no.). See instructions.
                            </div>
                            <div
                              style={{
                                borderBottom: "1px solid black",
                                height: "22px",
                              }}
                            >
                              <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                style={{
                                  width: "100%",
                                  border: "none",
                                  height: "100%",
                                  paddingLeft: "2px",
                                  fontSize: "9pt",
                                }}
                              />
                            </div>
                          </div>

                          {/* Line 6 */}
                          <div
                            style={{
                              borderTop: "1px solid black",
                              padding: "6px 8px",
                            }}
                          >
                            <div
                              style={{
                                fontSize: "9pt",
                                marginBottom: "2px",
                                lineHeight: "1.2",
                              }}
                            >
                              <span style={{ fontWeight: "bold" }}>6</span>
                              &nbsp;&nbsp;City, state, and ZIP code
                            </div>
                            <div
                              style={{
                                borderBottom: "1px solid black",
                                height: "22px",
                              }}
                            >
                              <input
                                type="text"
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                style={{
                                  width: "100%",
                                  border: "none",
                                  height: "100%",
                                  paddingLeft: "2px",
                                  fontSize: "9pt",
                                }}
                              />
                            </div>
                          </div>

                          {/* Empty space filler for flex column matching height */}
                          <div
                            style={{
                              flexGrow: 1,
                              borderTop: "1px solid black",
                            }}
                          ></div>
                        </div>

                        {/* Right Column (Line 4, Requester) - FLEX: 1 */}
                        <div
                          style={{
                            flex: 1,
                            display: "flex",
                            flexDirection: "column",
                          }}
                        >
                          {/* Line 4a */}
                          <div
                            style={{
                              padding: "6px 8px",
                              fontSize: "9pt",
                              lineHeight: "1.2",
                            }}
                          >
                            <span style={{ fontWeight: "bold" }}>4</span>
                            &nbsp;&nbsp;Exemptions (codes apply only to certain
                            entities, not individuals; see instructions).
                            <div style={{ fontSize: "9pt", marginTop: "10px" }}>
                              Exempt payee code (if any)
                            </div>
                            <div
                              style={{
                                borderBottom: "1px solid black",
                                height: "22px",
                                width: "100px",
                                marginTop: "2px",
                              }}
                            >
                              <input
                                type="text"
                                name="exemptPayeeCode"
                                value={formData.exemptPayeeCode}
                                onChange={handleChange}
                                style={{
                                  width: "100%",
                                  border: "none",
                                  height: "100%",
                                  paddingLeft: "2px",
                                  fontSize: "9pt",
                                }}
                                maxLength="1"
                              />
                            </div>
                          </div>

                          {/* Line 4b - BORDER REMOVED */}
                          <div
                            style={{
                              padding: "6px 8px",
                              fontSize: "9pt",
                              lineHeight: "1.2",
                            }}
                          >
                            <div style={{ fontSize: "9pt" }}>
                              Exemption from FATCA reporting code (if any)
                            </div>
                            <div
                              style={{
                                borderBottom: "1px solid black",
                                height: "22px",
                                width: "100px",
                                marginTop: "8px",
                              }}
                            >
                              <input
                                type="text"
                                name="fatcaCode"
                                value={formData.fatcaCode}
                                onChange={handleChange}
                                style={{
                                  width: "100%",
                                  border: "none",
                                  height: "100%",
                                  paddingLeft: "2px",
                                  fontSize: "9pt",
                                }}
                                maxLength="1"
                              />
                            </div>
                            <div style={{ fontSize: "9pt", marginTop: "10px" }}>
                              (Applies to accounts maintained outside the U.S.)
                            </div>
                          </div>

                          {/* Requester Info - MODIFIED for flex grow */}
                          <div
                            style={{
                              borderTop: "1px solid black",
                              padding: "6px 8px",
                              fontSize: "9pt",
                              lineHeight: "1.2",
                              flexGrow: 1,
                              display: "flex",
                              flexDirection: "column",
                            }}
                          >
                            <div>Requester's name and address (optional)</div>
                            <div
                              style={{
                                border: "1px solid black",
                                marginTop: "2px",
                                padding: "2px",
                                flexGrow: 1,
                              }}
                            >
                              <textarea
                                name="requesterInfo"
                                value={formData.requesterInfo}
                                onChange={handleChange}
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  border: "none",
                                  fontSize: "9pt",
                                  fontFamily: "Arial, sans-serif",
                                  minHeight: "50px",
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Row 2: Line 7 - FULL WIDTH (to the right of the vertical label) */}
                    <div
                      className="flex flex-col sm:flex-row"
                      style={{ borderTop: "1px solid black" }}
                    >
                      <div
                        className="hidden sm:flex"
                        style={{
                          width: "55px",
                          borderRight: "1px solid black",
                          padding: "6px 2px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontFamily: "Arial, sans-serif",
                          flexShrink: 0,
                        }}
                      >
                        {/* Empty space to align with Print/Type label on the left */}
                      </div>
                      <div style={{ flex: 1, padding: "6px 8px" }}>
                        <div
                          style={{
                            fontSize: "10pt",
                            marginBottom: "2px",
                            lineHeight: "1.2",
                          }}
                        >
                          <span style={{ fontWeight: "bold" }}>7</span>
                          &nbsp;&nbsp;List account number(s) here (optional)
                        </div>
                        <div
                          style={{
                            borderBottom: "1px solid black",
                            height: "22px",
                          }}
                        >
                          <input
                            type="text"
                            name="accountNumbers"
                            value={formData.accountNumbers}
                            onChange={handleChange}
                            style={{
                              width: "100%",
                              border: "none",
                              height: "100%",
                              paddingLeft: "2px",
                              fontSize: "9pt",
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* END REFACTORED SECTION */}

                  {/* Part I Header */}
                  <div
                    style={{
                      background: "black",
                      color: "white",
                      padding: "3px 8px",
                      marginBottom: "6px",
                      fontWeight: "bold",
                      fontSize: "10.5pt",
                      fontFamily: "Arial, sans-serif",
                    }}
                  >
                    Part I&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Taxpayer
                    Identification Number (TIN)
                  </div>

                  {/* Part I Content */}
                  <div
                    className="flex flex-col md:flex-row"
                    style={{ marginBottom: "10px", gap: "10px" }}
                  >
                    {/* Part I Text - NARROWER (flex: 1) */}
                    <div
                      className="flex-1"
                      style={{ fontSize: "10pt", lineHeight: "1.25" }}
                    >
                      <p style={{ marginBottom: "6px" }}>
                        Enter your TIN in the appropriate box. The TIN provided
                        must match the name given on line 1 to avoid backup
                        withholding. For individuals, this is generally your
                        social security number (SSN). However, for a resident
                        alien, sole proprietor, or disregarded entity, see the
                        instructions for Part I, later. For other entities, it
                        is your employer identification number (EIN). If you do
                        not have a number, see{" "}
                        <span style={{ fontStyle: "italic" }}>
                          How to get a TIN
                        </span>
                        , later.
                      </p>
                      <p style={{ fontWeight: "bold", marginBottom: "0" }}>
                        Note: If the account is in more than one name, see the
                        instructions for line 1. See also{" "}
                        <span style={{ fontStyle: "italic" }}>
                          What Name and Number To Give the Requester
                        </span>{" "}
                        for guidelines on whose number to enter.
                      </p>
                    </div>

                    {/* TIN Input Boxes - WIDER (width: 300px) */}
                    <div
                      className="w-full md:w-[300px]"
                      style={{ fontFamily: "Arial, sans-serif" }}
                    >
                      <div className="tin-label" style={{ width: "100%" }}>
                        Social security number
                      </div>
                      <div style={{ marginBottom: "5px" }}>
                        {/* SSN: 3-2-4 grouping */}
                        {createTinInputs("ssn", [3, 2, 4])}
                      </div>

                      <div
                        style={{
                          textAlign: "center",
                          fontWeight: "bold",
                          fontSize: "11pt",
                          margin: "5px 0",
                        }}
                      >
                        or
                      </div>

                      <div className="tin-label" style={{ width: "100%" }}>
                        Employer identification number
                      </div>
                      <div>
                        {/* EIN: 2-7 grouping */}
                        {createTinInputs("ein", [2, 7])}
                      </div>
                    </div>
                  </div>

                  {/* Part II Header */}
                  <div
                    style={{
                      background: "black",
                      color: "white",
                      padding: "3px 8px",
                      marginBottom: "6px",
                      fontWeight: "bold",
                      fontSize: "10.5pt",
                      fontFamily: "Arial, sans-serif",
                    }}
                  >
                    Part II&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Certification
                  </div>

                  {/* Certification Text */}
                  <div
                    style={{
                      fontSize: "10pt",
                      lineHeight: "1.25",
                      marginBottom: "8px",
                    }}
                  >
                    <p style={{ marginBottom: "3px" }}>
                      Under penalties of perjury, I certify that:
                    </p>
                    <p style={{ marginBottom: "3px" }}>
                      1. The number shown on this form is my correct taxpayer
                      identification number (or I am waiting for a number to be
                      issued to me); and
                    </p>
                    <p style={{ marginBottom: "3px" }}>
                      2. I am not subject to backup withholding because (a) I am
                      exempt from backup withholding, or (b) I have not been
                      notified by the Internal Revenue Service (IRS) that I am
                      subject to backup withholding as a result of a failure to
                      report all interest or dividends, or (c) the IRS has
                      notified me that I am no longer subject to backup
                      withholding; and
                    </p>
                    <p style={{ marginBottom: "3px" }}>
                      3. I am a U.S. citizen or other U.S. person (defined
                      below); and
                    </p>
                    <p style={{ marginBottom: "6px" }}>
                      4. The FATCA code(s) entered on this form (if any)
                      indicating that I am exempt from FATCA reporting is
                      correct.
                    </p>
                    <p style={{ marginBottom: "0" }}>
                      <span style={{ fontWeight: "bold" }}>
                        Certification instructions.
                      </span>{" "}
                      You must cross out item 2 above if you have been notified
                      by the IRS that you are currently subject to backup
                      withholding because you have failed to report all interest
                      and dividends on your tax return. For real estate
                      transactions, item 2 does not apply. For mortgage interest
                      paid, acquisition or abandonment of secured property,
                      cancellation of debt, contributions to an individual
                      retirement arrangement (IRA), and, generally, payments
                      other than interest and dividends, you are not required to
                      sign the certification, but you must provide your correct
                      TIN. See the instructions for Part II, later.
                    </p>
                  </div>

                  {/* Signature Line */}
                  <div
                    className="flex flex-col sm:flex-row"
                    style={{
                      borderTop: "2px solid black",
                      paddingTop: "6px",
                      fontFamily: "Arial, sans-serif",
                    }}
                  >
                    <div
                      className="sm:w-[75px] w-full mb-2 sm:mb-0"
                      style={{
                        fontWeight: "bold",
                        fontSize: "9.5pt",
                        paddingRight: "10px",
                        lineHeight: "1.1",
                      }}
                    >
                      Sign
                      <br />
                      Here
                    </div>
                    <div
                      className="flex-1 sm:border-r border-b sm:border-b-0 pb-4 sm:pb-0 mb-4 sm:mb-0"
                      style={{
                        borderRight: "1px solid black",
                        paddingRight: "10px",
                      }}
                    >
                      <input
                        type="text"
                        name="signature"
                        value={formData.signature}
                        onChange={handleChange}
                        placeholder="Type your signature"
                        style={{
                          width: "100%",
                          border: "none",
                          borderBottom: "1px solid black",
                          height: "32px",
                          marginBottom: "3px",
                          paddingLeft: "4px",
                          fontSize: "10pt",
                          fontFamily: "Brush Script MT, cursive",
                        }}
                      />
                      <div style={{ fontSize: "7.5pt" }}>
                        Signature of U.S. person
                      </div>
                    </div>
                    <div
                      className="w-full sm:w-[175px] sm:pl-[10px] pl-0"
                      style={{ paddingLeft: "10px" }}
                    >
                      <div
                        style={{
                          fontWeight: "bold",
                          fontSize: "9.5pt",
                          marginBottom: "3px",
                        }}
                      >
                        Date
                      </div>
                      <input
                        type="date"
                        name="signatureDate"
                        value={formData.signatureDate}
                        onChange={handleChange}
                        style={{
                          width: "100%",
                          border: "none",
                          borderBottom: "1px solid black",
                          height: "32px",
                          paddingLeft: "4px",
                          fontSize: "9pt",
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </form>

            {/* Footer */}
            <div
              className="flex justify-between items-center"
              style={{
                fontFamily: "Arial, sans-serif",
                fontSize: "7.5pt",
                marginTop: "10px",
              }}
            >
              <div>Cat. No. 10231X</div>
              <div>
                Form <span style={{ fontWeight: "bold" }}>W-9</span> (Rev.
                3-2024)
              </div>
            </div>
          </div>

          {/* Added Pages 2-6 below */}
          <Page2 />
          <div className="h-4 bg-gray-100" />
          <Page3 />
          <div className="h-4 bg-gray-100" />
          <Page4 />
          <div className="h-4 bg-gray-100" />
          <Page5 />
          <div className="h-4 bg-gray-100" />
          <Page6 />

          {/* Progress Section */}
          <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-semibold text-gray-700">
                  Application Progress
                </span>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-blue-600">
                  {completedFormsCount}/
                  {
                    FORM_KEYS.filter((key) =>
                      shouldCountForm(key, employmentType)
                    ).length
                  }
                </div>
                <div className="text-xs text-gray-600">Forms Completed</div>
              </div>
            </div>
            <div className="mb-2">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-gray-600">Overall Progress</span>
                <span className="text-xs font-semibold text-blue-600">
                  {overallProgress}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${overallProgress}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6">
            <button
              type="button"
              onClick={handlePrevious}
              className="flex-1 px-4 sm:px-6 py-2 sm:py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm sm:text-base font-medium"
            >
              Previous
            </button>
            <div className="flex-1 flex justify-center">
              <button
                type="button"
                onClick={() => navigate("/employee/task-management")}
                className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-[#1F3A93] to-[#2748B4] text-white font-semibold rounded-xl hover:from-[#16306e] hover:to-[#1F3A93] transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm sm:text-base"
              >
                Exit Application
              </button>
            </div>
            <button
              type="button"
              onClick={handleSaveAndNext}
              className="flex-1 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-[#1F3A93] to-[#2748B4] text-white rounded-lg hover:from-[#16306e] hover:to-[#1F3A93] transition-all duration-200 shadow-md text-sm sm:text-base font-medium"
            >
              Save & Next
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
