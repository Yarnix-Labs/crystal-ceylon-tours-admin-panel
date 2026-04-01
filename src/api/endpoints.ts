/**
 * Central API endpoint paths (no leading slash).
 * Used by admin services for consistency.
 */
export const ENDPOINTS = {

  authLogin: "/auth/login",
  authRefresh: "/auth/refresh",
  authLogout: "/auth/logout",
  authForgotPassword: "/auth/forgot/password",
  authResetPassword: "/auth/reset/password",
  authChangePassword: "/auth/change/password",
  authMe: "/auth/me",
  authUpdateProfile: "/auth/profile/update",

  companyDetails: "/company/details",

  companySocialMediaCreate: "/company/details/social-media",
  companySocialMediaList: "/company/details/social-media",
  companySocialMediaById: (id: number | string) =>`/company/details/social-media/${id}`,

  storageUploadProfile: "/storage/upload/profile",
  storageUploadImage: "/storage/upload/image",
  storageUploadAsset: "/storage/upload/asset",

  // Notifications
  notificationsList: "/notifications",
  notificationsFavorites: "/notifications/favorites",
  notificationFavorite: (id: number | string) =>`/notifications/favorite/${id}`,
  notificationUnfavorite: (id: number | string) =>`/notifications/unfavorite/${id}`,
  notificationReadAll: "/notifications/read/all",
  notificationRead: (id: number | string) =>`/notifications/read/${id}`,

  // Tour Packages
  tourPackages: "/tour-packages",
  tours: "/tour-packages",
  tourPackagesUpdate: (id: string | number) => `/tour-packages/${id}`,
  tourPackagesStatus: (id: string | number) => `/tour-packages/status/${id}`,
  tourPackagesDelete: (id: string | number) => `/tour-packages/${id}`,
  tourPackagesPublishedList: "/tour-packages",
  tourPackagesDraftsList: "/tour-packages/drafts",
  tourPackagesPublishedById: (id: string | number) => `/tour-packages/${id}`,
  tourPackagesDraftById: (id: string | number) => `/tour-packages/drafts/${id}`,
  tourById: (id: string) => `/tour-packages/${id}`,

  // Destinations
  destinations: "/destinations",
  destinationsCreate: "/destinations/create",
  destinationsUpdate: (id: string | number) => `/destinations/update/${id}`,
  destinationsStatus: (id: string | number) => `/destinations/status/${id}`,
  destinationsDelete: (id: string | number) => `/destinations/delete/${id}`,
  destinationsPublishedList: "/destinations/published/list",
  destinationsDraftsList: "/destinations/drafts/list",
  destinationsPublishedById: (id: string | number) => `/destinations/published/${id}`,
  destinationsDraftById: (id: string | number) => `/destinations/draft/${id}`,
  destinationById: (id: string) => `/destinations/${id}`,

  // Gallery
  galleryCreate: "/gallery/create",
  galleryGetAll: "/gallery",
  galleryUpdate: (id: string | number) => `/gallery/update/${id}`,
  galleryStatus: (id: string | number) => `/gallery/status/${id}`,
  galleryDelete: (id: string | number) => `/gallery/delete/${id}`,
  galleryGetById: (id: string | number) => `/gallery/${id}`,
  galleryGetInactive: "/gallery/inactive",
  galleryGetInactiveById: (id: string | number) => `/gallery/inactive/${id}`,

  // Blogs
  blogs: "/blogs",
  blogsCreate: "/blogs/create",
  blogsUpdate: (id: string | number) => `/blogs/update/${id}`,
  blogsStatus: (id: string | number) => `/blogs/status/${id}`,
  blogsDelete: (id: string | number) => `/blogs/delete/${id}`,
  blogsStats: "/blogs/stats",
  blogsPublishedList: "/blogs/published/list",
  blogsDraftsList: "/blogs/drafts/list",
  blogsPublishedById: (id: string | number) => `/blogs/published/${id}`,
  blogsDraftById: (id: string | number) => `/blogs/draft/${id}`,
  blogById: (id: string) => `/blogs/${id}`,

  // Things To Do
  thingsToDo: "/things-to-do",
  thingsToDoCreate: "/things-to-do/create",
  thingsToDoUpdate: (id: string | number) => `/things-to-do/update/${id}`,
  thingsToDoStatus: (id: string | number) => `/things-to-do/status/${id}`,
  thingsToDoDelete: (id: string | number) => `/things-to-do/delete/${id}`,
  thingsToDoPublishedList: "/things-to-do/published/list",
  thingsToDoDraftsList: "/things-to-do/drafts/list",
  thingsToDoPublishedById: (id: string | number) => `/things-to-do/published/${id}`,
  thingsToDoDraftById: (id: string | number) => `/things-to-do/draft/${id}`,
  thingToDoById: (id: string) => `/things-to-do/${id}`,

  // Reviews
  reviews: "/reviews",
  reviewsAdminList: "/reviews/admin/list",
  reviewsAdminFilter: "/reviews/admin/filter",
  reviewsById: (id: string | number) => `/reviews/admin/${id}`,
  reviewsByIdUpdate: (id: string | number) => `/reviews/${id}`,
  reviewsStatus: (id: string | number) => `/reviews/status/${id}`,

  // Bookings
  bookings: "/bookings",
  bookingsById: (id: string | number) => `/bookings/${id}`,
  bookingsFilter: "/bookings/filter",
  bookingsUpdateAdminNote: (id: string | number) =>`/bookings/admin-note/${id}`,
  bookingsUpdateStatus: (id: string | number) => `/bookings/status/${id}`,
  bookingsDelete: (id: string | number) => `/bookings/${id}`,

  // Custom Bookings
  customBookings: "/custom-bookings",
  customBookingsById: (id: string | number) => `/custom-bookings/${id}`,
  customBookingsFilter: "/custom-bookings/filter",
  customBookingsUpdateAdminNote: (id: string | number) =>`/custom-bookings/admin-note/${id}`,
  customBookingsUpdateStatus: (id: string | number) => `/custom-bookings/status/${id}`,
  customBookingsDelete: (id: string | number) => `/custom-bookings/${id}`,

  // Contact Messages
  contactMessagesList: "/contact/message/list",
  contactMessageById: (id: string | number) => `/contact/message/${id}`,
  contactMessagesFilter: "/contact/message/filter",
  contactMessageUpdateStatus: (id: string | number) => `/contact/status/${id}`,
  contactMessageUpdateAdminNote: (id: string | number) =>`/contact/admin/note/${id}`,
  contactMessageDelete: (id: string | number) =>`/contact/message/delete/${id}`,

  contactSupport: "/contact/support",
  contactSubscribers: "/contact/subscribers",

  // Dashboard
  dashboardAnalytics: "/dashboard/analytics",
  dashboardStats: "/dashboard/stats",
  GoogleAnalytics: "/dashboard/overview",

} as const;
