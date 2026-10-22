const inRoleRoutes = (paths) => {
  const inRole = [];
  for (const pathes of Object.values(paths)) {
    for (const pathe of Object.values(pathes)) {
      if (pathe.description === 'this operation protected by RBAC') {
        inRole.push({
          operationId: pathe.operationId,
          title: pathe.summary,
          tags: pathe.tags,
        });
      }
    }
  }
  return inRole;
};

export default inRoleRoutes;
