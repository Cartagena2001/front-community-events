import React, { useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import AppNavigator from './(auth)/_layout';

const RootNavigator = () => {
  const [loading, setLoading] = useState(false);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

    return <AppNavigator />;
};

export default RootNavigator;