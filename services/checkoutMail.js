const nodemailer = require("nodemailer");
const JSJoda = require("js-joda");
const getCheckoutDate = require("../utils/getCheckoutDate");
const LocalDate = JSJoda.LocalDate;

module.exports = function (userEmail, booking, userName) {
  let guests = 0;
  booking.roomFinalDetails.map(data => {
    guests += Number(data.adults);
    guests += Number(data.children);
  });

  totalPrice = 0;
  totalBeds = 0;
  totalRooms = 0;
  for (let [key, value] of Object.entries(booking.roomDetails)) {
    let objectValues = [];
    for (const [key1, value1] of Object.entries(value)) {
      objectValues.push(value1);
    }
    totalPrice += objectValues[0] * objectValues[1];
    totalBeds += objectValues[0] * objectValues[2];
    totalRooms += objectValues[0];
  }

  const start_date = new LocalDate.parse(booking.startingDayOfStay);
  const end_date = new LocalDate.parse(booking.endingDayOfStay);
  const totalDays = JSJoda.ChronoUnit.DAYS.between(start_date, end_date) + 1;

  booking.startingDayOfStay = new Date(booking.startingDayOfStay).toLocaleString("en-us", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  booking.endingDayOfStay = new Date(getCheckoutDate(booking.endingDayOfStay)).toLocaleString(
    "en-us",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  );

  const transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    service: "gmail",
    auth: {
      user: process.env.ADMIN_EMAIL,
      pass: process.env.ADMIN_PASSWORD,
    },
  });

  var mailOptions = {
    from: process.env.ADMIN_EMAIL,
    to: userEmail,
    subject: "Booking Confirmation",
    html: `
    <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html
  xmlns="http://www.w3.org/1999/xhtml"
  xmlns:o="urn:schemas-microsoft-com:office:office"
  style="
    width: 100%;
    font-family: arial, 'helvetica neue', helvetica, sans-serif;
    -webkit-text-size-adjust: 100%;
    -ms-text-size-adjust: 100%;
    padding: 0;
    margin: 0;
  "
>
  <head>
    <meta charset="UTF-8" />
    <meta content="width=device-width, initial-scale=1" name="viewport" />
    <meta name="x-apple-disable-message-reformatting" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta content="telephone=no" name="format-detection" />
    <title>New message</title>
    <!--[if (mso 16)]>
      <style type="text/css">
        a {
          text-decoration: none;
        }
      </style>
    <![endif]-->
    <!--[if gte mso 9
      ]><style>
        sup {
          font-size: 100% !important;
        }
      </style><!
    [endif]-->
    <!--[if gte mso 9]>
      <xml>
        <o:OfficeDocumentSettings>
          <o:AllowPNG></o:AllowPNG>
          <o:PixelsPerInch>96</o:PixelsPerInch>
        </o:OfficeDocumentSettings>
      </xml>
    <![endif]-->
    <style type="text/css">
      #outlook a {
        padding: 0;
      }
      .ExternalClass {
        width: 100%;
      }
      .ExternalClass,
      .ExternalClass p,
      .ExternalClass span,
      .ExternalClass font,
      .ExternalClass td,
      .ExternalClass div {
        line-height: 100%;
      }
      .es-button {
        mso-style-priority: 100 !important;
        text-decoration: none !important;
      }
      a[x-apple-data-detectors] {
        color: inherit !important;
        text-decoration: none !important;
        font-size: inherit !important;
        font-family: inherit !important;
        font-weight: inherit !important;
        line-height: inherit !important;
      }
      .es-desk-hidden {
        display: none;
        float: left;
        overflow: hidden;
        width: 0;
        max-height: 0;
        line-height: 0;
        mso-hide: all;
      }
      [data-ogsb] .es-button {
        border-width: 0 !important;
        padding: 10px 20px 10px 20px !important;
      }
      @media only screen and (max-device-width: 600px) {
        .es-content table,
        .es-header table,
        .es-footer table {
          width: 100% !important;
          max-width: 600px !important;
        }
      }
      @media only screen and (max-width: 600px) {
        p,
        ul li,
        ol li,
        a {
          line-height: 150% !important;
        }
        h1,
        h2,
        h3,
        h1 a,
        h2 a,
        h3 a {
          line-height: 120% !important;
        }
        h1 {
          font-size: 30px !important;
          text-align: center;
        }
        h2 {
          font-size: 26px !important;
          text-align: center;
        }
        h3 {
          font-size: 20px !important;
          text-align: center;
        }
        .es-header-body h1 a,
        .es-content-body h1 a,
        .es-footer-body h1 a {
          font-size: 30px !important;
        }
        .es-header-body h2 a,
        .es-content-body h2 a,
        .es-footer-body h2 a {
          font-size: 26px !important;
        }
        .es-header-body h3 a,
        .es-content-body h3 a,
        .es-footer-body h3 a {
          font-size: 20px !important;
        }
        .es-header-body p,
        .es-header-body ul li,
        .es-header-body ol li,
        .es-header-body a {
          font-size: 16px !important;
        }
        .es-content-body p,
        .es-content-body ul li,
        .es-content-body ol li,
        .es-content-body a {
          font-size: 16px !important;
        }
        .es-footer-body p,
        .es-footer-body ul li,
        .es-footer-body ol li,
        .es-footer-body a {
          font-size: 16px !important;
        }
        .es-infoblock p,
        .es-infoblock ul li,
        .es-infoblock ol li,
        .es-infoblock a {
          font-size: 12px !important;
        }
        *[class="gmail-fix"] {
          display: none !important;
        }
        .es-m-txt-c,
        .es-m-txt-c h1,
        .es-m-txt-c h2,
        .es-m-txt-c h3 {
          text-align: center !important;
        }
        .es-m-txt-r,
        .es-m-txt-r h1,
        .es-m-txt-r h2,
        .es-m-txt-r h3 {
          text-align: right !important;
        }
        .es-m-txt-l,
        .es-m-txt-l h1,
        .es-m-txt-l h2,
        .es-m-txt-l h3 {
          text-align: left !important;
        }
        .es-m-txt-r img,
        .es-m-txt-c img,
        .es-m-txt-l img {
          display: inline !important;
        }
        .es-button-border {
          display: block !important;
        }
        a.es-button,
        button.es-button {
          font-size: 20px !important;
          display: block !important;
          border-left-width: 0px !important;
          border-right-width: 0px !important;
          border-top-width: 5px !important;
          border-bottom-width: 5px !important;
        }
        .es-btn-fw {
          border-width: 10px 0px !important;
          text-align: center !important;
        }
        .es-adaptive table,
        .es-btn-fw,
        .es-btn-fw-brdr,
        .es-left,
        .es-right {
          width: 100% !important;
        }
        .es-content table,
        .es-header table,
        .es-footer table,
        .es-content,
        .es-footer,
        .es-header {
          width: 100% !important;
          max-width: 600px !important;
        }
        .es-adapt-td {
          display: block !important;
          width: 100% !important;
        }
        .adapt-img {
          width: 100% !important;
          height: auto !important;
        }
        .es-m-p0 {
          padding: 0px !important;
        }
        .es-m-p0r {
          padding-right: 0px !important;
        }
        .es-m-p0l {
          padding-left: 0px !important;
        }
        .es-m-p0t {
          padding-top: 0px !important;
        }
        .es-m-p0b {
          padding-bottom: 0 !important;
        }
        .es-m-p20b {
          padding-bottom: 20px !important;
        }
        .es-mobile-hidden,
        .es-hidden {
          display: none !important;
        }
        tr.es-desk-hidden,
        td.es-desk-hidden,
        table.es-desk-hidden {
          width: auto !important;
          overflow: visible !important;
          float: none !important;
          max-height: inherit !important;
          line-height: inherit !important;
        }
        tr.es-desk-hidden {
          display: table-row !important;
        }
        table.es-desk-hidden {
          display: table !important;
        }
        td.es-desk-menu-hidden {
          display: table-cell !important;
        }
        .es-menu td {
          width: 1% !important;
        }
        table.es-table-not-adapt,
        .esd-block-html table {
          width: auto !important;
        }
        table.es-social {
          display: inline-block !important;
        }
        table.es-social td {
          display: inline-block !important;
        }
        .es-menu td a {
          font-size: 16px !important;
        }
      }
    </style>
  </head>
  <body
    style="
      width: 100%;
      font-family: arial, 'helvetica neue', helvetica, sans-serif;
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
      padding: 0;
      margin: 0;
    "
  >
    <div class="es-wrapper-color" style="background-color: #efefef">
      <!--[if gte mso 9]>
        <v:background xmlns:v="urn:schemas-microsoft-com:vml" fill="t">
          <v:fill type="tile" color="#efefef"></v:fill>
        </v:background>
      <![endif]-->
      <table
        class="es-wrapper"
        width="100%"
        cellspacing="0"
        cellpadding="0"
        style="
          mso-table-lspace: 0pt;
          mso-table-rspace: 0pt;
          border-collapse: collapse;
          border-spacing: 0px;
          padding: 0;
          margin: 0;
          width: 100%;
          height: 100%;
          background-repeat: repeat;
          background-position: left top;
          background-color: #efefef;
        "
      >
        <tr style="border-collapse: collapse">
          <td valign="top" style="padding: 0; margin: 0">
            <table
              cellpadding="0"
              cellspacing="0"
              class="es-header"
              align="center"
              style="
                mso-table-lspace: 0pt;
                mso-table-rspace: 0pt;
                border-collapse: collapse;
                border-spacing: 0px;
                table-layout: fixed !important;
                width: 100%;
                background-color: transparent;
                background-repeat: repeat;
                background-position: center top;
              "
            >
              <tr style="border-collapse: collapse">
                <td align="center" style="padding: 0; margin: 0">
                  <table
                    class="es-header-body"
                    style="
                      mso-table-lspace: 0pt;
                      mso-table-rspace: 0pt;
                      border-collapse: collapse;
                      border-spacing: 0px;
                      background-color: #fef5e4;
                      width: 750px;
                    "
                    cellspacing="0"
                    cellpadding="0"
                    bgcolor="#fef5e4"
                    align="center"
                  >
                    <tr style="border-collapse: collapse">
                      <td
                        align="left"
                        style="
                          margin: 0;
                          padding-top: 5px;
                          padding-bottom: 5px;
                          padding-left: 10px;
                          padding-right: 15px;
                        "
                      >
                        <!--[if mso]><table style="width:725px" cellpadding="0" cellspacing="0"><tr><td style="width:199px" valign="top"><![endif]-->
                        <table
                          class="es-left"
                          cellspacing="0"
                          cellpadding="0"
                          align="left"
                          style="
                            mso-table-lspace: 0pt;
                            mso-table-rspace: 0pt;
                            border-collapse: collapse;
                            border-spacing: 0px;
                            float: left;
                          "
                        >
                          <tr style="border-collapse: collapse">
                            <td
                              class="es-m-p0r"
                              valign="top"
                              align="center"
                              style="padding: 0; margin: 0; width: 199px"
                            >
                              <table
                                width="100%"
                                cellspacing="0"
                                cellpadding="0"
                                role="presentation"
                                style="
                                  mso-table-lspace: 0pt;
                                  mso-table-rspace: 0pt;
                                  border-collapse: collapse;
                                  border-spacing: 0px;
                                "
                              >
                                <tr style="border-collapse: collapse">
                                  <td align="center" style="padding: 0; margin: 0; font-size: 0px">
                                    <img
                                      class="adapt-img"
                                      src="https://hotelbook-react.herokuapp.com/static/media/adithyalogo.8ed17367.png"
                                      alt
                                      style="
                                        display: block;
                                        border: 0;
                                        outline: none;
                                        text-decoration: none;
                                        -ms-interpolation-mode: bicubic;
                                      "
                                      width="194.977"
                                    />
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </table>
                        <!--[if mso]></td><td style="width:0px"></td><td style="width:526px" valign="top"><![endif]-->
                        <table
                          cellspacing="0"
                          cellpadding="0"
                          align="right"
                          style="
                            mso-table-lspace: 0pt;
                            mso-table-rspace: 0pt;
                            border-collapse: collapse;
                            border-spacing: 0px;
                          "
                        >
                          <tr style="border-collapse: collapse">
                            <td align="left" style="padding: 0; margin: 0; width: 526px">
                              <table
                                width="100%"
                                cellspacing="0"
                                cellpadding="0"
                                role="presentation"
                                style="
                                  mso-table-lspace: 0pt;
                                  mso-table-rspace: 0pt;
                                  border-collapse: collapse;
                                  border-spacing: 0px;
                                "
                              >
                                <tr style="border-collapse: collapse">
                                  <td
                                    align="right"
                                    style="
                                      padding: 0;
                                      margin: 0;
                                      padding-top: 20px;
                                      padding-left: 35px;
                                    "
                                  >
                                    <table
                                      border="0"
                                      class="es-table cke_show_border"
                                      align="right"
                                      cellspacing="1"
                                      cellpadding="1"
                                      style="
                                        mso-table-lspace: 0pt;
                                        mso-table-rspace: 0pt;
                                        border-collapse: collapse;
                                        border-spacing: 0px;
                                        width: 50%;
                                      "
                                      role="presentation"
                                    >
                                    <tr style="border-collapse: collapse">
                                      <td
                                        align="center"
                                        style="
                                          margin: 0;
                                          padding-left: 10px;
                                          padding-right: 10px;
                                          padding-top: 40px;
                                          padding-bottom: 40px;
                                        "
                                      >
                                        <span
                                          class="es-button-border"
                                          style="
                                            border-style: solid;
                                            border-color: #3d5ca3;
                                            background: #ffffff;
                                            border-width: 2px;
                                            display: inline-block;
                                            border-radius: 10px;
                                            width: auto;
                                          "
                                          ><a
                                            href="http://localhost:3000/linkreview/${booking.linkReviewId}"
                                            class="es-button"
                                            target="_blank"
                                            style="
                                              mso-style-priority: 100 !important;
                                              text-decoration: none;
                                              -webkit-text-size-adjust: none;
                                              -ms-text-size-adjust: none;
                                              mso-line-height-rule: exactly;
                                              color: #3d5ca3;
                                              font-size: 14px;
                                              border-style: solid;
                                              border-color: #ffffff;
                                              border-width: 15px 20px 15px 20px;
                                              display: inline-block;
                                              background: #ffffff;
                                              border-radius: 10px;
                                              font-family: arial, 'helvetica neue', helvetica,
                                                sans-serif;
                                              font-weight: bold;
                                              font-style: normal;
                                              line-height: 17px;
                                              width: auto;
                                              text-align: center;
                                            "
                                            >Write a Review</a
                                          ></span
                                        >
                                      </td>
                                    </tr>
                                    </table>
                                    <br /><br />
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </table>
                        <!--[if mso]></td></tr></table><![endif]-->
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
            <table
              cellpadding="0"
              cellspacing="0"
              class="es-content"
              align="center"
              style="
                mso-table-lspace: 0pt;
                mso-table-rspace: 0pt;
                border-collapse: collapse;
                border-spacing: 0px;
                table-layout: fixed !important;
                width: 100%;
              "
            >
              <tr style="border-collapse: collapse">
                <td align="center" style="padding: 0; margin: 0">
                  <table
                    bgcolor="#ffffff"
                    class="es-content-body"
                    align="center"
                    cellpadding="0"
                    cellspacing="0"
                    style="
                      mso-table-lspace: 0pt;
                      mso-table-rspace: 0pt;
                      border-collapse: collapse;
                      border-spacing: 0px;
                      background-color: #ffffff;
                      width: 750px;
                    "
                  >
                    <tr style="border-collapse: collapse">
                      <td
                        align="left"
                        style="
                          margin: 0;
                          padding-top: 5px;
                          padding-bottom: 5px;
                          padding-left: 10px;
                          padding-right: 10px;
                        "
                      >
                        <table
                          cellpadding="0"
                          cellspacing="0"
                          width="100%"
                          style="
                            mso-table-lspace: 0pt;
                            mso-table-rspace: 0pt;
                            border-collapse: collapse;
                            border-spacing: 0px;
                          "
                        >
                          <tr style="border-collapse: collapse">
                            <td
                              align="center"
                              valign="top"
                              style="padding: 0; margin: 0; width: 730px"
                            >
                              <table
                                cellpadding="0"
                                cellspacing="0"
                                width="100%"
                                role="presentation"
                                style="
                                  mso-table-lspace: 0pt;
                                  mso-table-rspace: 0pt;
                                  border-collapse: collapse;
                                  border-spacing: 0px;
                                "
                              >
                                <tr style="border-collapse: collapse">
                                  <td
                                    align="center"
                                    style="
                                      padding: 0;
                                      margin: 0;
                                      padding-bottom: 5px;
                                      padding-top: 20px;
                                    "
                                  >
                                    <h1
                                      style="
                                        margin: 0;
                                        line-height: 36px;
                                        mso-line-height-rule: exactly;
                                        font-family: 'trebuchet ms', helvetica, sans-serif;
                                        font-size: 30px;
                                        font-style: normal;
                                        font-weight: normal;
                                        color: #333333;
                                      "
                                    >
                                      Thank You For&nbsp; Choosing Us!
                                    </h1>
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
            <table
              class="es-content"
              cellspacing="0"
              cellpadding="0"
              align="center"
              style="
                mso-table-lspace: 0pt;
                mso-table-rspace: 0pt;
                border-collapse: collapse;
                border-spacing: 0px;
                table-layout: fixed !important;
                width: 100%;
              "
            >
              <tr style="border-collapse: collapse">
                <td align="center" style="padding: 0; margin: 0">
                  <table
                    class="es-content-body"
                    cellspacing="0"
                    cellpadding="0"
                    bgcolor="#ffffff"
                    align="center"
                    style="
                      mso-table-lspace: 0pt;
                      mso-table-rspace: 0pt;
                      border-collapse: collapse;
                      border-spacing: 0px;
                      background-color: #ffffff;
                      width: 750px;
                    "
                  >
                    <tr style="border-collapse: collapse">
                      <td
                        align="left"
                        style="
                          margin: 0;
                          padding-top: 20px;
                          padding-left: 20px;
                          padding-right: 20px;
                          padding-bottom: 30px;
                        "
                      >
                        <table
                          cellspacing="0"
                          cellpadding="0"
                          width="100%"
                          style="
                            mso-table-lspace: 0pt;
                            mso-table-rspace: 0pt;
                            border-collapse: collapse;
                            border-spacing: 0px;
                          "
                        >
                          <tr style="border-collapse: collapse">
                            <td align="left" style="padding: 0; margin: 0; width: 710px">
                              <table
                                style="
                                  mso-table-lspace: 0pt;
                                  mso-table-rspace: 0pt;
                                  border-collapse: collapse;
                                  border-spacing: 0px;
                                  border-top: 1px solid #efefef;
                                  border-bottom: 1px solid #efefef;
                                  background-color: #fef9ef;
                                "
                                width="100%"
                                cellspacing="0"
                                cellpadding="0"
                                bgcolor="#fef9ef"
                                role="presentation"
                              >
                                <tr style="border-collapse: collapse">
                                  <td
                                    align="left"
                                    style="
                                      margin: 0;
                                      padding-bottom: 10px;
                                      padding-top: 20px;
                                      padding-left: 20px;
                                      padding-right: 20px;
                                    "
                                  >
                                    <h4
                                      style="
                                        margin: 0;
                                        line-height: 120%;
                                        mso-line-height-rule: exactly;
                                        font-family: 'trebuchet ms', helvetica, sans-serif;
                                      "
                                    >
                                      SUMMARY:
                                    </h4>
                                  </td>
                                </tr>
                                <tr style="border-collapse: collapse">
                                  <td
                                    align="left"
                                    style="
                                      padding: 0;
                                      margin: 0;
                                      padding-left: 15px;
                                      padding-right: 40px;
                                    "
                                  >
                                    <table
                                      style="
                                        mso-table-lspace: 0pt;
                                        mso-table-rspace: 0pt;
                                        border-collapse: collapse;
                                        border-spacing: 0px;
                                        width: 100%;
                                      "
                                      class="cke_show_border"
                                      cellspacing="1"
                                      cellpadding="1"
                                      border="0"
                                      align="left"
                                      role="presentation"
                                    >
                                      <tr style="border-collapse: collapse">
                                        <td
                                          style="
                                            padding: 0;
                                            margin: 0;
                                            font-size: 14px;
                                            line-height: 21px;
                                          "
                                        >
                                          Checked-In:
                                        </td>
                                        <td
                                          style="
                                            padding: 0;
                                            margin: 0;
                                            font-size: 14px;
                                            line-height: 21px;
                                          "
                                        >
                                          ${booking.startingDayOfStay}
                                        </td>
                                      </tr>
                                      <tr style="border-collapse: collapse">
                                        <td
                                          style="
                                            padding: 0;
                                            margin: 0;
                                            font-size: 14px;
                                            line-height: 21px;
                                          "
                                        >
                                          Checked-Out
                                        </td>
                                        <td
                                          style="
                                            padding: 0;
                                            margin: 0;
                                            font-size: 14px;
                                            line-height: 21px;
                                          "
                                        >
                                          ${booking.endingDayOfStay}
                                        </td>
                                      </tr>
                                      <tr style="border-collapse: collapse">
                                        <td
                                          style="
                                            padding: 0;
                                            margin: 0;
                                            font-size: 14px;
                                            line-height: 21px;
                                          "
                                        >
                                          Number of Nights
                                        </td>
                                        <td
                                          style="
                                            padding: 0;
                                            margin: 0;
                                            font-size: 14px;
                                            line-height: 21px;
                                          "
                                        >
                                          ${totalDays}
                                        </td>
                                      </tr>
                                      <tr style="border-collapse: collapse">
                                        <td
                                          style="
                                            padding: 0;
                                            margin: 0;
                                            font-size: 14px;
                                            line-height: 21px;
                                          "
                                        >
                                          Total Rooms:
                                        </td>
                                        <td
                                          style="
                                            padding: 0;
                                            margin: 0;
                                            font-size: 14px;
                                            line-height: 21px;
                                          "
                                        >
                                          ${totalRooms}
                                        </td>
                                      </tr>
                                      <tr style="border-collapse: collapse">
                                        <td
                                          style="
                                            padding: 0;
                                            margin: 0;
                                            font-size: 14px;
                                            line-height: 21px;
                                          "
                                        >
                                          Total Guests:
                                        </td>
                                        <td
                                          style="
                                            padding: 0;
                                            margin: 0;
                                            font-size: 14px;
                                            line-height: 21px;
                                          "
                                        >
                                          ${guests}
                                        </td>
                                      </tr>
                                    </table>
                                    <p
                                      style="
                                        margin: 0;
                                        -webkit-text-size-adjust: none;
                                        -ms-text-size-adjust: none;
                                        mso-line-height-rule: exactly;
                                        font-family: arial, 'helvetica neue', helvetica, sans-serif;
                                        line-height: 21px;
                                        color: #333333;
                                        font-size: 14px;
                                      "
                                    >
                                      <br />
                                    </p>
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
            <table
              cellpadding="0"
              cellspacing="0"
              class="es-footer"
              align="center"
              style="
                mso-table-lspace: 0pt;
                mso-table-rspace: 0pt;
                border-collapse: collapse;
                border-spacing: 0px;
                table-layout: fixed !important;
                width: 100%;
                background-color: transparent;
                background-repeat: repeat;
                background-position: center top;
              "
            >
              <tr style="border-collapse: collapse">
                <td align="center" style="padding: 0; margin: 0">
                  <table
                    class="es-footer-body"
                    cellspacing="0"
                    cellpadding="0"
                    align="center"
                    style="
                      mso-table-lspace: 0pt;
                      mso-table-rspace: 0pt;
                      border-collapse: collapse;
                      border-spacing: 0px;
                      background-color: #fef5e4;
                      width: 750px;
                    "
                  >
                    <tr style="border-collapse: collapse">
                      <td align="left" style="padding: 20px; margin: 0">
                        <!--[if mso]><table style="width:710px" cellpadding="0" cellspacing="0"><tr><td style="width:253px" valign="top"><![endif]-->
                        <table
                          class="es-left"
                          cellspacing="0"
                          cellpadding="0"
                          align="left"
                          style="
                            mso-table-lspace: 0pt;
                            mso-table-rspace: 0pt;
                            border-collapse: collapse;
                            border-spacing: 0px;
                            float: left;
                          "
                        >
                          <tr style="border-collapse: collapse">
                            <td
                              class="es-m-p0r es-m-p20b"
                              valign="top"
                              align="center"
                              style="padding: 0; margin: 0; width: 253px"
                            >
                              <table
                                width="100%"
                                cellspacing="0"
                                cellpadding="0"
                                role="presentation"
                                style="
                                  mso-table-lspace: 0pt;
                                  mso-table-rspace: 0pt;
                                  border-collapse: collapse;
                                  border-spacing: 0px;
                                "
                              >
                                <tr style="border-collapse: collapse">
                                  <td
                                    class="es-m-p0l es-m-txt-c"
                                    align="left"
                                    style="padding: 0; margin: 0; font-size: 0px"
                                  >
                                    <img
                                      src="https://hotelbook-react.herokuapp.com/static/media/adithyalogo.8ed17367.png"
                                      alt="Petshop logo"
                                      title="Petshop logo"
                                      width="108"
                                      style="
                                        display: block;
                                        border: 0;
                                        outline: none;
                                        text-decoration: none;
                                        -ms-interpolation-mode: bicubic;
                                      "
                                    />
                                  </td>
                                </tr>
                                <tr style="border-collapse: collapse">
                                  <td
                                    class="es-m-txt-c"
                                    align="left"
                                    style="
                                      padding: 0;
                                      margin: 0;
                                      padding-bottom: 5px;
                                      padding-top: 10px;
                                    "
                                  >
                                    <p
                                      style="
                                        margin: 0;
                                        -webkit-text-size-adjust: none;
                                        -ms-text-size-adjust: none;
                                        mso-line-height-rule: exactly;
                                        font-family: arial, 'helvetica neue', helvetica, sans-serif;
                                        line-height: 21px;
                                        color: #333333;
                                        font-size: 14px;
                                      "
                                    >
                                      Adithya Group of Hotels
                                    </p>
                                    <p
                                      style="
                                        margin: 0;
                                        -webkit-text-size-adjust: none;
                                        -ms-text-size-adjust: none;
                                        mso-line-height-rule: exactly;
                                        font-family: arial, 'helvetica neue', helvetica, sans-serif;
                                        line-height: 21px;
                                        color: #333333;
                                        font-size: 14px;
                                      "
                                    >
                                  
                                    </p>
                                  </td>
                                </tr>
                                <tr style="border-collapse: collapse">
                                  <td
                                    class="es-m-txt-c"
                                    align="left"
                                    style="padding: 0; margin: 0; padding-top: 5px"
                                  >
                                    <p
                                      style="
                                        margin: 0;
                                        -webkit-text-size-adjust: none;
                                        -ms-text-size-adjust: none;
                                        mso-line-height-rule: exactly;
                                        font-family: arial, 'helvetica neue', helvetica, sans-serif;
                                        line-height: 21px;
                                        color: #333333;
                                        font-size: 14px;
                                      "
                                    >
                                      <p
                                        style="
                                          -webkit-text-size-adjust: none;
                                          -ms-text-size-adjust: none;
                                          mso-line-height-rule: exactly;
                                          text-decoration: underline;
                                          color: #333333;
                                          font-size: 14px;
                                        "
                                        >+91 9483236255</p
                                      ><br /><p
                                        style="
                                          -webkit-text-size-adjust: none;
                                          -ms-text-size-adjust: none;
                                          mso-line-height-rule: exactly;
                                          text-decoration: underline;
                                          color: #333333;
                                          font-size: 14px;
                                        "
                                        >adithyagroupofhotels@gmail.com</p
                                      >
                                    </p>
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </table>
                        <!--[if mso]></td><td style="width:20px"></td><td style="width:437px" valign="top"><![endif]-->
                        <table
                          cellspacing="0"
                          cellpadding="0"
                          align="right"
                          style="
                            mso-table-lspace: 0pt;
                            mso-table-rspace: 0pt;
                            border-collapse: collapse;
                            border-spacing: 0px;
                          "
                        >
                          <tr style="border-collapse: collapse">
                            <td align="left" style="padding: 0; margin: 0; width: 437px">
                              <table
                                width="100%"
                                cellspacing="0"
                                cellpadding="0"
                                role="presentation"
                                style="
                                  mso-table-lspace: 0pt;
                                  mso-table-rspace: 0pt;
                                  border-collapse: collapse;
                                  border-spacing: 0px;
                                "
                              >
                                <tr style="border-collapse: collapse">
                                  <td
                                    class="es-m-txt-c"
                                    align="left"
                                    style="
                                      padding: 0;
                                      margin: 0;
                                      padding-top: 15px;
                                      padding-bottom: 20px;
                                    "
                                  >
                                    <p
                                      style="
                                        margin: 0;
                                        -webkit-text-size-adjust: none;
                                        -ms-text-size-adjust: none;
                                        mso-line-height-rule: exactly;
                                        font-family: arial, 'helvetica neue', helvetica, sans-serif;
                                        line-height: 30px;
                                        color: #333333;
                                        font-size: 20px;
                                      "
                                    >
                                     
                                    </p>
                                  </td>
                                </tr>
                                <tr style="border-collapse: collapse">
                                  <td class="es-m-txt-c" align="left" style="padding: 0; margin: 0">
                                    <p
                                      style="
                                        margin: 0;
                                        -webkit-text-size-adjust: none;
                                        -ms-text-size-adjust: none;
                                        mso-line-height-rule: exactly;
                                        font-family: arial, 'helvetica neue', helvetica, sans-serif;
                                        line-height: 21px;
                                        color: #333333;
                                        font-size: 14px;
                                      "
                                    >
                                      <br />
                                    </p>
                                    <p
                                      style="
                                        margin: 0;
                                        -webkit-text-size-adjust: none;
                                        -ms-text-size-adjust: none;
                                        mso-line-height-rule: exactly;
                                        font-family: arial, 'helvetica neue', helvetica, sans-serif;
                                        line-height: 21px;
                                        color: #333333;
                                        font-size: 14px;
                                      "
                                    >
                                      <br />
                                    </p>
                                  </td>
                                </tr>
                                <tr style="border-collapse: collapse">
                                  <td
                                    align="left"
                                    class="es-m-txt-c"
                                    style="padding: 0; margin: 0; padding-top: 10px"
                                  >
                                    <p
                                      style="
                                        margin: 0;
                                        -webkit-text-size-adjust: none;
                                        -ms-text-size-adjust: none;
                                        mso-line-height-rule: exactly;
                                        font-family: arial, 'helvetica neue', helvetica, sans-serif;
                                        line-height: 18px;
                                        color: #333333;
                                        font-size: 12px;
                                      "
                                    >
                                      
                                    </p>
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </table>
                        <!--[if mso]></td></tr></table><![endif]-->
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </div>
  </body>
</html>
    `,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) return console.log(error);
    console.log("Email sent: " + info.response);
  });
};
