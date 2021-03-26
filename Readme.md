- Keepa API docs:  https://keepa.com/#!discuss/t/product-object/116

- The data arrays come from an API (Keepa).

- The data we want to display is:
1. "Won %" - Percentage of time each seller held the buy box
2. Avg Price - The average buy box price for each seller while they held the buy box
3. Avg new offer count - Average number of offers (i.e. people selling the same item) while each seller held the buy box
4. Seller name - A display of the name of each seller
5. Last won - When each seller most recently held the buy box

- Any timestamps in the data are in "Keepa Time", which is a special type of timestamp.  It's explained in the Keepa API docs but basically, to convert to a Unix timestamp you would do the following:  (t + 21564000) * 60