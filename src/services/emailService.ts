/**
 * Email Service
 * 
 * This service handles sending emails for restaurant registration and approval.
 * It integrates with the FrontDash backend architecture:
 * - RestaurantService: handles restaurant registration and status updates
 * - AdminService: handles restaurant approval workflow
 * - Email/NotificationService: (backend) handles actual email delivery
 * 
 * Backend API Endpoints (expected):
 * - POST /api/restaurants/register - Restaurant registration (triggers pending email)
 * - POST /api/admin/restaurants/{id}/approve - Admin approval (triggers approval email)
 * - POST /api/notifications/email - Direct email sending endpoint
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

export interface EmailOptions {
  to: string;
  subject: string;
  body: string;
  html?: string;
}

export interface RestaurantRegistrationRequest {
  restaurantName: string;
  description: string;
  cuisineType: string;
  establishedYear?: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  email: string;
  website?: string;
  averagePrice: string;
  deliveryFee: string;
  minimumOrder: string;
  preparationTime: string;
  operatingHours: {
    [key: string]: {
      open: string;
      close: string;
      closed: boolean;
    };
  };
  menuItems?: Array<{
    name: string;
    description: string;
    price: string;
    category: string;
  }>;
}

export interface RestaurantApprovalRequest {
  restaurantId: number;
  username: string;
  temporaryPassword: string;
}

/**
 * Generate a secure temporary password for restaurant accounts
 * Note: In production, this should ideally be done on the backend (AuthService)
 */
export function generateTemporaryPassword(): string {
  const length = 12;
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  const password = Array.from({ length }, () => 
    charset[Math.floor(Math.random() * charset.length)]
  ).join('');
  return password;
}

/**
 * Send an email via backend API
 * Calls the backend notification/email service
 */
async function sendEmail(options: EmailOptions): Promise<void> {
  const useBackend = import.meta.env.VITE_USE_BACKEND === 'true';
  
  if (useBackend) {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add auth token if needed
          // 'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify(options)
      });

      if (!response.ok) {
        throw new Error(`Email API returned status ${response.status}`);
      }
      
      const result = await response.json();
      console.log('✅ Email sent successfully:', result);
    } catch (error) {
      console.error('❌ Failed to send email via API:', error);
      // Fallback to console logging in development
      console.log('📧 Email (fallback):', {
        to: options.to,
        subject: options.subject,
        body: options.body,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  } else {
    // Development mode: log to console
    console.log('📧 Email Sent (dev mode):', {
      to: options.to,
      subject: options.subject,
      body: options.body,
      timestamp: new Date().toISOString()
    });
  }
}

/**
 * Register a restaurant via RestaurantService
 * Backend will automatically send pending approval email
 */
export async function registerRestaurant(
  registrationData: RestaurantRegistrationRequest
): Promise<{ success: boolean; restaurantId?: number; error?: string }> {
  const useBackend = import.meta.env.VITE_USE_BACKEND === 'true';
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
  
  console.log('📡 Registration request:', {
    useBackend,
    apiBaseUrl,
    restaurantName: registrationData.restaurantName,
  });
  
  if (useBackend) {
    try {
      console.log('📡 Calling backend:', `${apiBaseUrl}/restaurants/register`);
      const response = await fetch(`${apiBaseUrl}/restaurants/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...registrationData,
          status: 'pending'
        })
      });

      console.log('📡 Response status:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText || `Registration failed with status ${response.status}` };
        }
        throw new Error(errorData.message || errorData.error || `Registration failed with status ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Restaurant registered successfully:', result);
      
      // Backend RestaurantService should automatically trigger pending approval email
      // via the Email/NotificationService
      
      return {
        success: true,
        restaurantId: result.restaurantId || result.id
      };
    } catch (error: any) {
      console.error('❌ Failed to register restaurant:', error);
      console.error('Error details:', {
        message: error.message,
        name: error.name,
        stack: error.stack,
      });
      
      // Provide more helpful error messages
      let errorMessage = error.message || 'Failed to register restaurant';
      if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
        errorMessage = 'Cannot connect to backend server. Please ensure the backend is running on http://localhost:8080';
      }
      
      return {
        success: false,
        error: errorMessage
      };
    }
  } else {
    // Development mode: simulate registration and send email manually
    console.log('📝 Restaurant Registration (dev mode):', registrationData);
    
    // Send pending approval email manually in dev mode
    await sendPendingApprovalEmail(
      registrationData.email,
      registrationData.restaurantName
    );
    
    return {
      success: true,
      restaurantId: Date.now() // Mock ID
    };
  }
}

/**
 * Approve a restaurant via AdminService
 * Backend will automatically send approval email with credentials
 */
export async function approveRestaurant(
  restaurantId: number,
  restaurantEmail: string,
  restaurantName: string
): Promise<{ success: boolean; credentials?: { username: string; password: string }; error?: string }> {
  const useBackend = import.meta.env.VITE_USE_BACKEND === 'true';
  
  if (useBackend) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/restaurants/${restaurantId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add admin auth token
          // 'Authorization': `Bearer ${getAdminAuthToken()}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        const errorMessage = errorData.error || errorData.message || `Approval failed with status ${response.status}`;
        console.error('❌ Approval API error:', errorData);
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('✅ Restaurant approved successfully:', result);
      
      // Backend AdminService should:
      // 1. Update Restaurant status to 'approved'
      // 2. Create Login entry via AuthService
      // 3. Create RestaurantAccount linking Restaurant to Login
      // 4. Generate temporary password
      // 5. Trigger approval email via Email/NotificationService with credentials
      
      return {
        success: true,
        credentials: {
          username: result.username || restaurantEmail,
          password: result.temporaryPassword || '***' // Backend generates this
        }
      };
    } catch (error: any) {
      console.error('❌ Failed to approve restaurant:', error);
      return {
        success: false,
        error: error.message || 'Failed to approve restaurant'
      };
    }
  } else {
    // Development mode: simulate approval
    console.log('✅ Restaurant Approval (dev mode):', { restaurantId, restaurantEmail, restaurantName });
    
    // Generate credentials manually in dev mode
    const temporaryPassword = generateTemporaryPassword();
    const username = restaurantEmail;
    
    // Send approval email manually in dev mode
    await sendApprovalEmail(
      restaurantEmail,
      restaurantName,
      username,
      temporaryPassword,
      `${window.location.origin}/restaurant-signin`
    );
    
    return {
      success: true,
      credentials: {
        username,
        password: temporaryPassword
      }
    };
  }
}

/**
 * Send pending approval email to restaurant after registration
 * This is typically called by the backend RestaurantService automatically,
 * but can be called manually if needed
 */
export async function sendPendingApprovalEmail(email: string, restaurantName: string): Promise<void> {
  const subject = "Your restaurant registration is pending approval";
  const body = `
Dear ${restaurantName},

Thank you for registering with FrontDash!

We have received your restaurant registration application and it is currently pending admin approval.

What happens next:
- Our team will review your restaurant information and menu details
- This process typically takes 2-3 business days
- You'll receive another email once your account has been approved

Once approved, you'll receive your login credentials and access to your restaurant dashboard where you can:
- Manage your menu
- Track orders
- Update your restaurant information
- View analytics and reports

If you have any questions, please don't hesitate to contact our support team at support@frontdash.com.

Thank you for choosing FrontDash!

Best regards,
The FrontDash Team
  `.trim();

  await sendEmail({
    to: email,
    subject,
    body
  });
}

/**
 * Send approval email with login credentials to restaurant
 * This is typically called by the backend AdminService automatically,
 * but can be called manually if needed
 */
export async function sendApprovalEmail(
  email: string, 
  restaurantName: string, 
  username: string, 
  temporaryPassword: string,
  loginUrl: string = `${window.location.origin}/restaurant-signin`
): Promise<void> {
  const subject = "Your restaurant has been approved – login details inside";
  const body = `
Dear ${restaurantName},

Great news! Your restaurant account has been approved and you can now access FrontDash!

Your Login Credentials:
Username: ${username}
Temporary Password: ${temporaryPassword}

IMPORTANT: Please log in and change your password immediately for security purposes.

Login URL: ${loginUrl}

Next Steps:
1. Log in using the credentials above
2. Change your temporary password to something secure
3. Complete your restaurant profile setup
4. Add your menu items and photos
5. Start accepting orders!

If you have any questions or need assistance, please contact our support team:
- Email: support@frontdash.com
- Phone: 1-800-FRONTDASH

We're excited to have you on board!

Best regards,
The FrontDash Team
  `.trim();

  await sendEmail({
    to: email,
    subject,
    body
  });
}
