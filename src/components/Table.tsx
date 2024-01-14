import React from "react";

interface TableProps {
  data: {
    id: string;
    sender: string;
    isInvestorEmail: boolean;
    subject: string;
    // Uncomment and add types for other properties if needed
    toRecipients: string;
  }[];
}

const Table: React.FC<TableProps> = ({ data }) => {
  const capitalizeFirstLetter = (string: string): string => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  const extractName = (email: string): string => {
    if (!email) return ""; // Return an empty string or a default value if email is undefined
    const name = email.split("@")[0];
    return capitalizeFirstLetter(name);
  };

  const extractDomain = (email: string): string => {
    if (!email) return "";
    const parts = email.split("@");
    if (parts.length < 2) return ""; // Returns empty if '@' symbol is missing or nothing follows it

    const domainPart = parts[1];
    const domain = domainPart.split(".")[0];
    return domain;
  };

  const investorOrNot = (bool: boolean): string => {
    return bool ? "Investor Email" : "Non-investor Email";
  };

  return (
    <table style={{ textAlign: "left" }}>
      <tbody>
        <tr>
          <th>Inbound Email Interactions: </th>
        </tr>
        {data.map((item) => {
          const senderName = extractName(item.sender);
          const recipientName = extractName(item.toRecipients);
          const recipientDomain = extractDomain(item.toRecipients);
          const investorEmail = investorOrNot(item.isInvestorEmail);

          return (
            <tr key={item.id}>
              {/* <td>
                {senderName} connected with {recipientName} at {recipientDomain}{" "}
                about {item.subject}
              </td> */}
              <td>
                {senderName} connected with {recipientName} about {item.subject}
              </td>
              {/* <td>{(item.isInvestorEmail).toString()}: {senderName} talked about {item.subject}</td> */}
              <td>
                {/* {investorEmail}: {senderName} talked about {item.subject} */}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default Table;
