const UserRoles = {
    ADMIN: 'admin',
    GUEST: 'guest'
};

const Permissions = {
    [UserRoles.ADMIN]: ['add', 'remove', 'clear', 'save', 'view', 'export'],
    [UserRoles.GUEST]: ['view', 'changeColors', 'toggleAnimation']
};

module.exports = { UserRoles, Permissions };
