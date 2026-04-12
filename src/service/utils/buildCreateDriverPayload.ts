export const buildCreateDriverPayload = (user: any) => ({
  first_name: user.first_name,
  last_name: user.last_name,
  full_name: user.full_name,
  phone_number: user.phone_number,
  email: user.email,
  date_of_birth: user.date_of_birth,
  gender: user.gender,
  role: 'driver',
  status: 'active',
  address: user.address,
});

