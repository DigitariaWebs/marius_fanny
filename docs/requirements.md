# Marius & Fanny - Project Requirements

## Business Overview

Marius & Fanny is a patisserie with three sales channels:
- Physical store in Montreal
- Physical store/workshop in Laval
- Online store

## User Roles

### Admin
Full system access and configuration capabilities

### Staff
- Take orders (phone and in-store)
- Manage daily production
- Process payments

### User (Client)
- Place online orders
- View order status
- Make payments

## Locations & Logistics

### Montreal Location
- Store front only
- Pick-up point for customer orders
- Receives deliveries from Laval workshop

### Laval Location
- Main workshop where production happens
- Pick-up point for customer orders
- Source location for Montreal deliveries

### Inter-location Delivery Schedule

Orders set for Montreal pick-up must be delivered from Laval workshop to Montreal location.

**Delivery Days:** (Configurable)
- Monday
- Tuesday
- Thursday

**Delivery Rules:**
- Orders must arrive at pick-up location at least 1 day before customer pick-up date
- System should automatically schedule delivery to nearest available delivery date before pick-up date

## Core Features

### 1. Centralized Order Management
- Single interface for all sales channels (Montreal, Laval, online)
- Real-time order tracking
- Admin dashboard for complete oversight

### 2. Staff Order Portal (Phone & In-Store)

**Order Entry Process:**
1. Staff member takes client information:
   - Client name
   - Phone number
   - Email address

2. Product selection:
   - Select products with quantities
   - Add notes for each product
   - System calculates subtotal based on unit prices

3. Delivery/Pick-up options:
   - Pick-up from Montreal location
   - Pick-up from Laval location
   - Home delivery

4. Total calculation:
   - Subtotal
   - Taxes
   - Delivery fees (if applicable)

5. Payment process:
   - 50% deposit required upfront
   - Invoice created via Square integration
   - Invoice sent to client email
   - Once paid, kitchen staff is notified to start production

### 3. Online Ordering System (Client-Facing)
- Web-based interface
- Mobile-responsive design
- Product browsing and selection
- Shopping cart functionality
- Time slot selection for pick-up/delivery
- Secure payment processing

### 4. Delivery Management

**Delivery Fees & Minimums:**
- Based on postal codes
- Configurable minimum order amounts per zone
- Automatic fee calculation

**Delivery Time Slots:**
- Customer selects preferred delivery window
- System validates availability
- Considers inter-location delivery schedules

### 5. Product Intelligence & Rules

**Order Cutoff Times:**
- Per-product deadline configuration
- Prevents orders that cannot be fulfilled on time

**Preparation Time:**
- Each product has defined prep time
- System calculates earliest available pick-up/delivery date

**Quantity Limits:**
- Maximum quantities per product
- Prevents overloading production capacity

### 6. Production Management

**Daily Production Lists:**
- Real-time generation based on all orders
- Printable format
- Grouped by product
- Shows all orders requiring each product

**In-Store Inventory:**
- Daily inventory of products available in store
- Added to production list
- Updates automatically

**Production Status Tracking:**
- Mark individual products as ready
- Products ready at different times
- Visual indicators for production progress

### 7. Payment Processing

**Payment Options:**
- Full payment upfront
- Deposit (50%) with balance due on pick-up/delivery
- Square integration for invoice generation and processing

**Payment Tracking:**
- Payment status per order
- Outstanding balances
- Payment history

### 8. Order Modifications

**Edit Capability:**
- Modify orders after creation
- Track changes/history
- Update production lists automatically

**Production Markers:**
- Mark products during preparation
- Track completion status
- Handle products ready at different times

### 9. Communication & Notifications

**Email Confirmations:**
- Order confirmation sent to client
- Payment confirmations
- Order ready notifications

**Staff Notifications:**
- Kitchen staff alerted when payment received
- Production status updates
- Delivery schedule reminders

### 10. Administrative Dashboard

**Management Sections:**
- Order management and overview
- Menu/product configuration
- Staff management
- Payment tracking and reports
- Location and delivery schedule configuration
- Product rules configuration (cutoffs, prep times, limits)

## Technical Requirements

### Integration
- Square API for payment processing
- Email service for notifications

### Security
- Secure payment processing
- User authentication and authorization
- Role-based access control

### User Experience
- Simple, intuitive interface
- Mobile-responsive design
- Fast load times
- Clear visual feedback

### Data Management
- Real-time updates
- Data persistence
- Audit trails for orders and modifications

## Success Criteria

1. All sales channels consolidated into single system
2. Automated production list generation
3. Seamless payment processing
4. Efficient inter-location delivery coordination
5. Staff can process orders quickly and accurately
6. Clients have clear visibility into their orders
7. Production team receives timely, organized work lists