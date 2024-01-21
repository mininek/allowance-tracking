Create a Google spreadsheet with a sheet for each child whose account will be managed. Each sheet should look like this:

![Allowance_tracker_sheet](https://github.com/mininek/allowance-tracking/assets/37295266/e11ccc80-14ff-43fc-8685-72826f21ebbb)

Using the format menu, make the format for columns **A** and **E** as **number -> currency**;  **B** and **F** as **number -> date**.

Change format for cell **B4** to **date**.

The label in cell **D1** is the label you assign to a filter in your email. You should have an understanding with your child that they will send an email to your personal email address (which will be the owner of this google spreadsheet) with a constant, filterable subject, whenever they spend money from their account. You should label those emails and enter the label in cell **D1**. In the body, the email should have **2 lines**: 1st line: dollars spent (numbers only, the program will take the absolute value of the number), 2nd line: brief description of purchase, other lines will be ignored.

For example, if your child buys a hot wheels car for $5 they should send an email from their address (Child_email_address_at_domain.com) to the address that owns the spreadsheet with the subject "spending" (asssuming that you are labeling emails coming from this address AND with the subject "spending" with the label in D1) and the body of the email should have these two lines:
```
5
hot wheels car
```

The code in Code.gs file should be pasted in the **extensions -> apps script** of the allowance spreadsheet you created. For the functions to run, you should **authorize the script**. You should also set up **time driven triggers** for the **weekly allowance, weekly email** and **hourly transaction check** functions. Run the weekly allowance function before the weekly email function so the child receives the email with the latest allowance added.

This app is not for setting limits, it is just for making it easier to answer the question "How much money do I have?" coming from a child that doesn't have a bank account :-) 

Enjoy responsibly!
